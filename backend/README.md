# Royal Spice Backend

Node.js, Express, MongoDB, Mongoose, JWT authentication, bcryptjs, Multer uploads, Razorpay API, and admin/order APIs.

## Scripts

```bash
npm run dev
npm start
npm run seed
```

## Environment

Copy `.env.example` to `.env` and set MongoDB, JWT, Razorpay, and client URL values.

## API Documentation

Base URL:

```txt
http://localhost:5000/api
```

Auth:

- `POST /auth/signup`
- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me`

Foods:

- `GET /foods`
- `GET /foods/:slug`
- `POST /foods` admin, multipart image field `imageFile`
- `PUT /foods/:id` admin, multipart image field `imageFile`
- `DELETE /foods/:id` admin

Cart:

- `GET /cart`
- `POST /cart`
- `PUT /cart/:foodId`
- `DELETE /cart/:foodId`
- `DELETE /cart`

Orders and payments:

- `POST /orders/quote`
- `POST /orders`
- `GET /orders/mine`
- `GET /orders/:id`
- `PATCH /orders/:id/status` admin
- `POST /payments/razorpay/create-order`
- `POST /payments/razorpay/verify`
- `POST /payments/upi/mark-pending`

Users:

- `PUT /users/profile`
- `POST /users/addresses`
- `DELETE /users/addresses/:addressId`

Extras:

- `POST /reservations`
- `GET /admin/analytics`
- `POST /notifications/subscribe`
