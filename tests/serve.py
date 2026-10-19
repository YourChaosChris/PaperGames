#!/usr/bin/env python3
"""Static file server for the test series (used by tests/run-all.sh).

Same as `python3 -m http.server PORT` (serves the current directory), but:
- HTTP/1.1 with keep-alive: the browser tests open thousands of connections;
  with one connection per file the Mac ran out of ports (ERR_CONNECTION_TIMED_OUT,
  page.goto timeouts) late in a serial run.
- a longer listen queue, so bursts of connections are not dropped.
- no access log.
"""
import sys
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer


class Handler(SimpleHTTPRequestHandler):
    protocol_version = "HTTP/1.1"

    def log_message(self, *args):
        pass


class Server(ThreadingHTTPServer):
    request_queue_size = 256
    daemon_threads = True


if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
    Server(("", port), Handler).serve_forever()
