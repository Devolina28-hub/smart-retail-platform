def _get_token(client, email="staff@example.com", password="supersecret"):
    client.post("/auth/signup", json={"name": "Staff", "email": email, "password": password, "role": "admin"})
    resp = client.post("/auth/login", data={"username": email, "password": password})
    return resp.json()["access_token"]


def test_create_and_list_customers(client):
    token = _get_token(client)
    headers = {"Authorization": f"Bearer {token}"}

    create_resp = client.post(
        "/customers",
        json={"name": "Jane Doe", "phone": "1234567890", "email": "jane@example.com", "gender": "female"},
        headers=headers,
    )
    assert create_resp.status_code == 201

    list_resp = client.get("/customers", headers=headers)
    assert list_resp.status_code == 200
    assert any(c["name"] == "Jane Doe" for c in list_resp.json())
