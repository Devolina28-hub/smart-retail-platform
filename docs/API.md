# API Reference

Base URL (local): `http://localhost:8000`
Interactive docs (Swagger): `http://localhost:8000/docs`
Interactive docs (ReDoc): `http://localhost:8000/redoc`

Auth: send `Authorization: Bearer <access_token>` on every protected route.
Get a token from `POST /auth/login`.

## Auth — `/auth`
| Method | Path | Description | Auth |
|---|---|---|---|
| POST | `/auth/signup` | Create an account, returns tokens | Public |
| POST | `/auth/login` | Email + password login (form-encoded, `username`=email) | Public |
| POST | `/auth/forgot-password` | Generates a reset token (dev: returned in response body) | Public |
| POST | `/auth/reset-password` | Reset password using the token | Public |
| GET  | `/auth/me` | Current user profile | Bearer |

## Customers — `/customers`
| Method | Path | Description | Auth |
|---|---|---|---|
| GET | `/customers` | List, with `search`, `gender`, `page`, `page_size` | Staff |
| POST | `/customers` | Create a customer record (no face) | Staff |
| GET | `/customers/export.csv` | Download all customers as CSV | Staff |
| GET | `/customers/{id}` | Get one customer | Staff |
| PUT | `/customers/{id}` | Update a customer | Staff |
| DELETE | `/customers/{id}` | Delete a customer | Staff |
| GET | `/customers/{id}/visits` | Visit history for a customer | Staff |

## Face Recognition — `/face`
| Method | Path | Description | Auth |
|---|---|---|---|
| POST | `/face/register` | multipart: `name`, `phone?`, `email?`, `gender?`, `image` | Staff |
| POST | `/face/recognize` | multipart: `image` — matches against stored customers, logs a visit | Staff |

## Products — `/products`
| Method | Path | Description | Auth |
|---|---|---|---|
| GET | `/products` | List, with `category`, `search`, `page`, `page_size` | Public |
| POST | `/products` | multipart form: `name`, `category`, `price`, `stock`, `image?` | Staff |
| GET | `/products/{id}` | Get one product | Public |
| PUT | `/products/{id}` | Update a product | Staff |
| DELETE | `/products/{id}` | Delete a product | Staff |

## Product Recognition — `/classify`
| Method | Path | Description | Auth |
|---|---|---|---|
| POST | `/classify` | multipart: `image` → top-k category predictions | Staff |
| GET | `/classify/status` | Whether a trained classifier is loaded | Public |

## Reviews & Sentiment — `/reviews`, `/sentiment`
| Method | Path | Description | Auth |
|---|---|---|---|
| GET | `/reviews` | List reviews, filter by `sentiment`, `product_id` | Bearer |
| POST | `/reviews` | Create a review — sentiment computed automatically | Bearer |
| POST | `/reviews/upload-csv` | Bulk import + analyze a CSV (`review` column required) | Bearer |
| POST | `/sentiment` | Stateless: `{ "text": "..." }` → sentiment (no DB write) | Public |

## Chatbot — `/chat`
| Method | Path | Description | Auth |
|---|---|---|---|
| POST | `/chat` | `{ "message": "..." }` → answer + intent + confidence | Bearer |
| GET | `/chat/history` | Current user's last 100 messages | Bearer |

## Analytics — `/analytics`
| Method | Path | Description | Auth |
|---|---|---|---|
| GET | `/analytics/summary` | Dashboard headline numbers | Staff |
| GET | `/analytics/visits-timeline?days=7` | Daily visit counts | Staff |
| GET | `/analytics/review-breakdown` | Review counts by sentiment | Staff |
| GET | `/analytics/top-categories` | Product counts by category | Staff |

## Admin — `/admin`
| Method | Path | Description | Auth |
|---|---|---|---|
| GET | `/admin/users` | List all users | Admin |
| PUT | `/admin/users/{id}/role?role=admin` | Change a user's role | Admin |
| DELETE | `/admin/users/{id}` | Delete a user | Admin |
| GET | `/admin/status` | DB / face / product / sentiment model status | Admin |

**Roles:** `admin` (full access), `employee`/`staff` routes (customers, products, face, analytics), `customer` (chat, reviews, own profile).
