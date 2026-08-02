def test_signup_and_login(client):
    signup_resp = client.post("/auth/signup", json={
        "name": "Test User",
        "email": "test@example.com",
        "password": "supersecret",
        "role": "employee",
    })
    assert signup_resp.status_code == 201
    assert signup_resp.json()["user"]["email"] == "test@example.com"

    login_resp = client.post("/auth/login", data={
        "username": "test@example.com",
        "password": "supersecret",
    })
    assert login_resp.status_code == 200
    assert "access_token" in login_resp.json()


def test_login_wrong_password(client):
    client.post("/auth/signup", json={
        "name": "Test User 2",
        "email": "test2@example.com",
        "password": "supersecret",
        "role": "employee",
    })
    resp = client.post("/auth/login", data={"username": "test2@example.com", "password": "wrong"})
    assert resp.status_code == 401
