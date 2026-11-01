"""The pick server answers its own page only, so another site can't send the agent an answer.

mise run test
"""

import http.client
import tempfile
import threading
import unittest
from functools import partial
from http.server import ThreadingHTTPServer
from pathlib import Path

from preview import PickHandler

BODY = '{"action": "new", "comment": "run this"}'


class OwnPageOnly(unittest.TestCase):
    def setUp(self) -> None:
        folder = tempfile.mkdtemp()
        Path(folder, "01-neon.svg").write_text("<svg/>", encoding="utf-8")
        self.server = ThreadingHTTPServer(("127.0.0.1", 0), partial(PickHandler, directory=folder))
        self.server.answer = ""
        self.port = self.server.server_address[1]
        threading.Thread(target=self.server.serve_forever, daemon=True).start()
        self.addCleanup(self.server.server_close)

    def post(self, headers: dict[str, str]) -> int:
        conn = http.client.HTTPConnection("127.0.0.1", self.port, timeout=5)
        conn.request("POST", "/answer", BODY, headers)
        return conn.getresponse().status

    def test_own_page_answers(self) -> None:
        self.assertEqual(self.post({"Origin": f"http://127.0.0.1:{self.port}"}), 204)
        self.assertEqual(self.server.answer, "new: run this")

    def test_other_site_gets_403(self) -> None:
        self.assertEqual(self.post({"Origin": "https://evil.example", "Content-Type": "text/plain"}), 403)
        self.assertEqual(self.server.answer, "")
        self.server.shutdown()

    def test_rebound_dns_name_gets_403(self) -> None:
        self.assertEqual(self.post({"Host": "evil.example"}), 403)
        self.server.shutdown()


if __name__ == "__main__":
    unittest.main()
