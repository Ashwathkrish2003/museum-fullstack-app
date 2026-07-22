"""
Standalone integration test for the FastAPI museum backend.

Usage (from the backend/ directory, with the server already running):
    python test_endpoints.py

Requirements:
    pip install requests
"""

import json
import sys
import requests

BASE_URL = "http://127.0.0.1:8000"

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

results: list = []  # list of {"label": str, "passed": bool, "response": Response|None}


def _record(label: str, passed: bool, response=None):
    results.append({"label": label, "passed": passed, "response": response})


def check(label: str, response: requests.Response, expected_status: int) -> bool:
    ok = response.status_code == expected_status
    _record(label, ok, response if not ok else None)
    status_str = "PASS" if ok else "FAIL"
    print(f"  [{status_str}] {label}  (HTTP {response.status_code})")
    if not ok:
        print(f"         Expected HTTP {expected_status}")
        try:
            print(f"         Response: {response.json()}")
        except Exception:
            print(f"         Response: {response.text[:300]}")
    return ok


def pretty(data) -> str:
    return json.dumps(data, indent=2)


def section(title: str):
    print(f"\n{'='*60}")
    print(f"  {title}")
    print(f"{'='*60}")


# ---------------------------------------------------------------------------
# 1. LOGIN
# ---------------------------------------------------------------------------

section("1  Authentication  POST /auth/login")

login_resp = requests.post(
    f"{BASE_URL}/auth/login",
    json={"username": "admin", "password": "admin123"},
)

if not check("POST /auth/login", login_resp, 200):
    print("\n  Cannot continue without a valid token. Aborting.")
    sys.exit(1)

token = login_resp.json()["access_token"]
print(f"  Token obtained: {token[:40]}...")

HEADERS = {"Authorization": f"Bearer {token}"}


# ---------------------------------------------------------------------------
# 2. GET /artists/
# ---------------------------------------------------------------------------

section("2  Artists  GET /artists/")

artists_resp = requests.get(f"{BASE_URL}/artists/", headers=HEADERS)
check("GET /artists/", artists_resp, 200)

if artists_resp.status_code == 200:
    artists_data = artists_resp.json()
    print(f"  Total artists returned: {len(artists_data)}")
    print(f"  First 2 results:\n{pretty(artists_data[:2])}")


# ---------------------------------------------------------------------------
# 3. POST /artists/  (create test artist)
# ---------------------------------------------------------------------------

section("3  Artists  POST /artists/ (create)")

new_artist_payload = {
    "name": "_Test Artist (delete me)",
    "nationality": "Testland",
    "gender": "Unknown",
    "birth_year": 1900,
    "death_year": 2000,
}

create_artist_resp = requests.post(
    f"{BASE_URL}/artists/",
    json=new_artist_payload,
    headers=HEADERS,
)
check("POST /artists/", create_artist_resp, 201)

created_artist_id = None
if create_artist_resp.status_code == 201:
    created_artist = create_artist_resp.json()
    created_artist_id = created_artist["id"]
    print(f"  Created artist:\n{pretty(created_artist)}")


# ---------------------------------------------------------------------------
# 4. GET /dashboard/stats
# ---------------------------------------------------------------------------

section("4  Dashboard  GET /dashboard/stats")

stats_resp = requests.get(f"{BASE_URL}/dashboard/stats", headers=HEADERS)
check("GET /dashboard/stats", stats_resp, 200)

if stats_resp.status_code == 200:
    print(f"  Stats:\n{pretty(stats_resp.json())}")


# ---------------------------------------------------------------------------
# 5. DELETE /artists/{id}
# ---------------------------------------------------------------------------

section("5  Artists  DELETE /artists/{id}")

if created_artist_id is not None:
    delete_artist_resp = requests.delete(
        f"{BASE_URL}/artists/{created_artist_id}",
        headers=HEADERS,
    )
    check(f"DELETE /artists/{created_artist_id}", delete_artist_resp, 204)
    if delete_artist_resp.status_code == 204:
        print(f"  Artist id={created_artist_id} successfully deleted.")
else:
    _record("DELETE /artists/{id}", False)
    print("  [SKIP] No artist id available — create step failed.")


# ---------------------------------------------------------------------------
# 6. GET /artworks/
# ---------------------------------------------------------------------------

section("6  Artworks  GET /artworks/")

artworks_resp = requests.get(f"{BASE_URL}/artworks/", headers=HEADERS)
check("GET /artworks/", artworks_resp, 200)

if artworks_resp.status_code == 200:
    artworks_data = artworks_resp.json()
    print(f"  Total artworks returned: {len(artworks_data)}")
    print(f"  First 2 results:\n{pretty(artworks_data[:2])}")


# ---------------------------------------------------------------------------
# 7. POST /artworks/  (create test artwork)
# ---------------------------------------------------------------------------

section("7  Artworks  POST /artworks/ (create)")

new_artwork_payload = {
    "title": "_Test Artwork (delete me)",
    "date": "2024",
    "medium": "Digital",
    "classification": "Test",
    "department": "QA",
    "artist_id": None,
}

create_artwork_resp = requests.post(
    f"{BASE_URL}/artworks/",
    json=new_artwork_payload,
    headers=HEADERS,
)
check("POST /artworks/", create_artwork_resp, 201)

created_artwork_id = None
if create_artwork_resp.status_code == 201:
    created_artwork = create_artwork_resp.json()
    created_artwork_id = created_artwork["id"]
    print(f"  Created artwork:\n{pretty(created_artwork)}")


# ---------------------------------------------------------------------------
# 8. DELETE /artworks/{id}
# ---------------------------------------------------------------------------

section("8  Artworks  DELETE /artworks/{id}")

if created_artwork_id is not None:
    delete_artwork_resp = requests.delete(
        f"{BASE_URL}/artworks/{created_artwork_id}",
        headers=HEADERS,
    )
    check(f"DELETE /artworks/{created_artwork_id}", delete_artwork_resp, 204)
    if delete_artwork_resp.status_code == 204:
        print(f"  Artwork id={created_artwork_id} successfully deleted.")
else:
    _record("DELETE /artworks/{id}", False)
    print("  [SKIP] No artwork id available — create step failed.")


# ---------------------------------------------------------------------------
# 9. POST /artists/bulk
# ---------------------------------------------------------------------------

section("9  Artists  POST /artists/bulk")

bulk_artist_payload = {
    "artists": [
        {"name": "_Bulk Artist A (delete me)", "nationality": "Testland", "birth_year": 1980},
        {"name": "_Bulk Artist B (delete me)", "nationality": "Testland", "birth_year": 1985},
    ]
}

bulk_create_resp = requests.post(
    f"{BASE_URL}/artists/bulk",
    json=bulk_artist_payload,
    headers=HEADERS,
)
check("POST /artists/bulk", bulk_create_resp, 201)

bulk_artist_ids = []
if bulk_create_resp.status_code == 201:
    bulk_artists = bulk_create_resp.json()
    bulk_artist_ids = [a["id"] for a in bulk_artists]
    print(f"  Bulk-created artists:\n{pretty(bulk_artists)}")


# ---------------------------------------------------------------------------
# 10. POST /artists/bulk-delete
# ---------------------------------------------------------------------------

section("10  Artists  POST /artists/bulk-delete")

if bulk_artist_ids:
    bulk_delete_resp = requests.post(
        f"{BASE_URL}/artists/bulk-delete",
        json={"ids": bulk_artist_ids},
        headers=HEADERS,
    )
    check("POST /artists/bulk-delete", bulk_delete_resp, 204)
    if bulk_delete_resp.status_code == 204:
        print(f"  Bulk-deleted artist ids: {bulk_artist_ids}")
else:
    _record("POST /artists/bulk-delete", False)
    print("  [SKIP] No bulk artist ids available — bulk create step failed.")


# ---------------------------------------------------------------------------
# SUMMARY
# ---------------------------------------------------------------------------

section("SUMMARY")

passed = sum(1 for r in results if r["passed"])
total  = len(results)
width  = max(len(r["label"]) for r in results) + 2

print(f"\n  {'Endpoint':<{width}}  Result")
print(f"  {'-' * width}  ------")
for r in results:
    icon = "PASS" if r["passed"] else "FAIL"
    marker = "+" if r["passed"] else "x"
    print(f"  [{marker}] {r['label']:<{width}}  {icon}")
    if not r["passed"] and r["response"] is not None:
        try:
            body = r["response"].json()
        except Exception:
            body = r["response"].text[:200]
        print(f"       {'':>{width}}  -> HTTP {r['response'].status_code}: {body}")

print(f"\n  Result: {passed}/{total} passed")
if passed == total:
    print("  All tests passed!")
else:
    print(f"  {total - passed} test(s) failed.")

sys.exit(0 if passed == total else 1)
