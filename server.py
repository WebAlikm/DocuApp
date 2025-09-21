#!/usr/bin/env python3
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
import json
import os
from urllib.parse import urlparse
from datetime import datetime, timedelta

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
QUEUE_FILE = os.path.join(BASE_DIR, 'waitlist.json')
AVG_MINS_PER_REQUEST = 60 * 24 * 7  # 1 week per request (10080 minutes)
DEFAULT_SEED = 0
DEFAULT_WEEKLY_CAP = int(os.getenv('WEEKLY_CAP', '10'))
ADMIN_TOKEN = os.getenv('ADMIN_TOKEN')  # set in env; if None, admin endpoints will reject

# Helpers to manage state with backward compatibility

def current_week_key():
    now = datetime.now()
    iso = now.isocalendar()  # (year, week, weekday)
    return f"{iso.year}-W{iso.week:02d}"


def load_state():
    # Backward compatible: if only {'total': N} exists, upgrade to full shape
    state = {"total": DEFAULT_SEED, "weeks": {}, "cap": DEFAULT_WEEKLY_CAP}
    if os.path.exists(QUEUE_FILE):
        try:
            with open(QUEUE_FILE, 'r', encoding='utf-8') as f:
                data = json.load(f)
                if isinstance(data, dict):
                    state["total"] = int(data.get("total", DEFAULT_SEED))
                    if "weeks" in data and isinstance(data["weeks"], dict):
                        state["weeks"] = data["weeks"]
                    if "cap" in data:
                        try:
                            state["cap"] = int(data["cap"]) or DEFAULT_WEEKLY_CAP
                        except Exception:
                            state["cap"] = DEFAULT_WEEKLY_CAP
        except Exception:
            pass
    return state


def save_state(state: dict):
    try:
        with open(QUEUE_FILE, 'w', encoding='utf-8') as f:
            json.dump({
                "total": int(state.get("total", 0)),
                "weeks": state.get("weeks", {}),
                "cap": int(state.get("cap", DEFAULT_WEEKLY_CAP)),
            }, f)
    except Exception:
        pass


def next_week_open_datetime(hour=9, minute=0):
    now = datetime.now()
    # Start of this week (Mon 00:00)
    week_start = now - timedelta(days=now.isoweekday() - 1)
    week_start = week_start.replace(hour=0, minute=0, second=0, microsecond=0)
    # Next week's opening time (Mon 09:00 by default)
    next_open = week_start + timedelta(days=7)
    next_open = next_open.replace(hour=hour, minute=minute, second=0, microsecond=0)
    return next_open


def format_human(dt: datetime):
    now = datetime.now()
    if dt.year != now.year:
        return dt.strftime('%a, %b %d, %Y %I:%M %p')
    return dt.strftime('%a, %b %d %I:%M %p')


class WaitlistHandler(SimpleHTTPRequestHandler):
    def _set_cors_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, X-Admin-Token')

    def _require_admin(self):
        if not ADMIN_TOKEN:
            return False
        token = self.headers.get('X-Admin-Token')
        return bool(token) and token == ADMIN_TOKEN

    def do_OPTIONS(self):
        parsed = urlparse(self.path)
        if parsed.path.startswith('/api/'):
            self.send_response(204)
            self._set_cors_headers()
            self.end_headers()
        else:
            super().do_OPTIONS()

    def do_GET(self):
        parsed = urlparse(self.path)
        if parsed.path == '/api/waitlist/status':
            state = load_state()
            wk = current_week_key()
            wk_data = state["weeks"].get(wk, {})
            current_count = int(wk_data.get("count", 0))
            cap = int(state.get('cap', DEFAULT_WEEKLY_CAP))
            remaining = max(0, cap - current_count)
            next_open = next_week_open_datetime()
            resp = {
                'total': int(state.get('total', 0)),
                'weekly_cap': cap,
                'week_key': wk,
                'current_week_count': current_count,
                'remaining_this_week': remaining,
                'next_open_iso': next_open.isoformat(),
                'next_open_human': format_human(next_open),
            }
            body = json.dumps(resp).encode('utf-8')
            self.send_response(200)
            self._set_cors_headers()
            self.send_header('Content-Type', 'application/json; charset=utf-8')
            self.send_header('Content-Length', str(len(body)))
            self.end_headers()
            self.wfile.write(body)
            return
        return super().do_GET()

    def do_POST(self):
        parsed = urlparse(self.path)
        if parsed.path == '/api/waitlist/enqueue':
            state = load_state()
            wk = current_week_key()
            wk_data = state["weeks"].get(wk, {"count": 0})
            current_count = int(wk_data.get("count", 0))
            cap = int(state.get('cap', DEFAULT_WEEKLY_CAP))

            if current_count >= cap:
                resp = {
                    'accepted': False,
                    'reason': 'weekly_cap_reached',
                    'weekly_cap': cap,
                    'week_key': wk,
                    'current_week_count': current_count,
                    'remaining_this_week': 0,
                    'total': int(state.get('total', 0)),
                }
                body = json.dumps(resp).encode('utf-8')
                self.send_response(200)
                self._set_cors_headers()
                self.send_header('Content-Type', 'application/json; charset=utf-8')
                self.send_header('Content-Length', str(len(body)))
                self.end_headers()
                self.wfile.write(body)
                return

            # Accept this application into this week's cap
            current_count += 1
            wk_data["count"] = current_count
            state["weeks"][wk] = wk_data
            state["total"] = int(state.get("total", 0)) + 1
            save_state(state)

            position = current_count  # slot within this week
            remaining = max(0, cap - current_count)
            resp = {
                'accepted': True,
                'total': int(state.get('total', 0)),
                'position': position,
                'weekly_cap': cap,
                'week_key': wk,
                'remaining_this_week': remaining,
            }
            body = json.dumps(resp).encode('utf-8')
            self.send_response(200)
            self._set_cors_headers()
            self.send_header('Content-Type', 'application/json; charset=utf-8')
            self.send_header('Content-Length', str(len(body)))
            self.end_headers()
            self.wfile.write(body)
            return

        if parsed.path == '/api/admin/reset':
            if not self._require_admin():
                self.send_response(403)
                self._set_cors_headers()
                self.send_header('Content-Type', 'application/json; charset=utf-8')
                body = json.dumps({'error': 'Forbidden'}).encode('utf-8')
                self.send_header('Content-Length', str(len(body)))
                self.end_headers()
                self.wfile.write(body)
                return
            # Parse JSON body
            length = int(self.headers.get('Content-Length', '0') or 0)
            raw = self.rfile.read(length) if length > 0 else b''
            payload = {}
            try:
                payload = json.loads(raw.decode('utf-8')) if raw else {}
            except Exception:
                payload = {}
            state = load_state()
            state["weeks"] = {}
            state["total"] = int(payload.get('total', 0))
            if 'cap' in payload:
                try:
                    state['cap'] = int(payload['cap'])
                except Exception:
                    pass
            save_state(state)
            body = json.dumps({'ok': True, 'state': state}).encode('utf-8')
            self.send_response(200)
            self._set_cors_headers()
            self.send_header('Content-Type', 'application/json; charset=utf-8')
            self.send_header('Content-Length', str(len(body)))
            self.end_headers()
            self.wfile.write(body)
            return

        if parsed.path == '/api/admin/cap':
            if not self._require_admin():
                self.send_response(403)
                self._set_cors_headers()
                self.send_header('Content-Type', 'application/json; charset=utf-8')
                body = json.dumps({'error': 'Forbidden'}).encode('utf-8')
                self.send_header('Content-Length', str(len(body)))
                self.end_headers()
                self.wfile.write(body)
                return
            length = int(self.headers.get('Content-Length', '0') or 0)
            raw = self.rfile.read(length) if length > 0 else b''
            try:
                data = json.loads(raw.decode('utf-8')) if raw else {}
            except Exception:
                data = {}
            new_cap = data.get('cap')
            try:
                new_cap = int(new_cap)
            except Exception:
                new_cap = None
            if not new_cap or new_cap < 1:
                body = json.dumps({'ok': False, 'error': 'invalid_cap'}).encode('utf-8')
                self.send_response(400)
                self._set_cors_headers()
                self.send_header('Content-Type', 'application/json; charset=utf-8')
                self.send_header('Content-Length', str(len(body)))
                self.end_headers()
                self.wfile.write(body)
                return
            state = load_state()
            state['cap'] = new_cap
            save_state(state)
            body = json.dumps({'ok': True, 'cap': new_cap}).encode('utf-8')
            self.send_response(200)
            self._set_cors_headers()
            self.send_header('Content-Type', 'application/json; charset=utf-8')
            self.send_header('Content-Length', str(len(body)))
            self.end_headers()
            self.wfile.write(body)
            return

        self.send_response(404)
        self._set_cors_headers()
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        body = json.dumps({'error': 'Not Found'}).encode('utf-8')
        self.send_header('Content-Length', str(len(body)))
        self.end_headers()
        self.wfile.write(body)


def run(host='0.0.0.0', port=8001):
    os.chdir(BASE_DIR)
    httpd = ThreadingHTTPServer((host, port), WaitlistHandler)
    print(f"Serving on http://{host}:{port}")
    httpd.serve_forever()


if __name__ == '__main__':
    run()