# Apex Commerce — Server API

Express and MongoDB backend for the Apex Commerce project. It provides authentication, product management, order management, dashboard statistics, user administration, and ImageKit image uploads.

## Tech stack

- Node.js with ES modules
- Express 5
- MongoDB and Mongoose
- JSON Web Tokens (access and refresh tokens)
- bcrypt password hashing
- express-validator
- cookie-parser and CORS
- Multer memory storage for uploaded images
- ImageKit Node SDK for image uploads

## Requirements

- Node.js and npm
- MongoDB connection string (local MongoDB or a hosted MongoDB deployment)
- ImageKit private key if image uploads are to be used

## Install and run

From the project root:

```bash
cd server
npm install
npm run dev
```

The server reads `PORT` from the environment. The client currently points to `http://localhost:4500/api`, so use `PORT=4500` for local development unless you also update the client's API base URL. If `PORT` is not set, `server.js` falls back to port `5000`.

The current `dev` and `start` scripts both use Nodemon. For production hosting, configure the start command to run Node directly (for example, `node server.js`) and make sure the hosting environment installs the required dependencies.

## Environment variables

Create `server/.env` locally. Keep real values private and never commit this file.

```dotenv
PORT=4500
MONGO_URI=your_mongodb_connection_string
CLIENT_URL=http://localhost:5173
ACCESS_TOKEN_SECRET=replace_with_a_long_random_secret
REFRESH_TOKEN_SECRET=replace_with_another_long_random_secret
NODE_ENV=development
IMAGEKIT_PRICATE_KEY=your_imagekit_private_key
```

**Variable-name note:** the code currently reads the ImageKit key as `IMAGEKIT_PRICATE_KEY` (the spelling in the code is `PRICATE`). Either use that exact name in `.env` or update both `src/config/config.js` and `src/services/storageServices.js` consistently before deployment.

## API base path

All API routes are mounted below `/api`.

### Authentication — `/api/auth`

| Method | Endpoint | Access | Purpose |
| --- | --- | --- | --- |
| `POST` | `/register` | Public | Register an account; new accounts default to role `user` |
| `POST` | `/login` | Public | Sign in and receive an access token; refresh token is set as an HTTP-only cookie |
| `GET` | `/me` | Authenticated | Get the current user's profile |
| `POST` | `/refresh` | Refresh cookie | Refresh access token |
| `POST` | `/logout` | Public/cookie-based | Revoke refresh token and clear cookie |

### Products — `/api/products`

| Method | Endpoint | Access | Purpose |
| --- | --- | --- | --- |
| `GET` | `/` | Public | List products, including seller details |
| `GET` | `/:id` | Public | Get a product by ID |
| `POST` | `/` | Authenticated | Create a product and upload up to four images |
| `PUT` | `/:id` | Authenticated + ownership/admin check | Update a product; optional image replacement |
| `DELETE` | `/:id` | Authenticated + ownership/admin check | Delete a product |

Product records store a seller user ID. The update/delete controller allows an admin or the product's owner to manage the product. Note that the current create endpoint checks authentication but does **not** explicitly require the `seller` role; tighten this permission check before production if only sellers/admins should create products.

### Orders — `/api/orders`

All order routes require authentication unless otherwise stated by their middleware.

| Method | Endpoint | Access | Purpose |
| --- | --- | --- | --- |
| `POST` | `/` | Authenticated | Create an order from submitted product IDs and quantities |
| `GET` | `/` | Authenticated | List the signed-in user's orders |
| `GET` | `/admin/all` | Admin | List/search/paginate all orders |
| `GET` | `/:id` | Owner or admin (controller check) | Get an order by ID |
| `PATCH` | `/:id/status` | Admin | Update order status |
| `PATCH` | `/:id/notes` | Admin | Update admin notes on an order |
| `GET` | `/admin/stats` | Intended admin endpoint | Get order statistics |

Order statuses are `pending`, `confirmed`, `shipped`, `delivered`, and `cancelled`. The current model stores the customer, line items, total amount, status, notes, and timestamps. It does not define payment method/status or shipping-address fields, and no payment gateway is configured in the supplied code.

**Route-order note:** in `src/routes/orderRoutes.js`, `GET /:id` is declared before `GET /admin/stats`. Express can match `/admin/stats` as `/:id` first. Move the specific `/admin/stats` route above `/:id` to make the statistics endpoint reliably reachable.

### Dashboard — `/api/dashboard`

| Method | Endpoint | Access | Purpose |
| --- | --- | --- | --- |
| `GET` | `/stats` | Admin | Return user/product/order counts, delivered-order revenue, and recent orders |

### Users — `/api/users`

All user-management routes require both authentication and the admin role.

| Method | Endpoint | Access | Purpose |
| --- | --- | --- |
| `GET` | `/` | Admin | Search and paginate users; password and refresh token are excluded |
| `GET` | `/stats` | Admin | Count total users, customers (`user` role), sellers, and admins |
| `GET` | `/:id` | Admin | Get user details without password/refresh token |
| `PATCH` | `/:id/role` | Admin | Change a user's role to `user`, `seller`, or `admin` (cannot change own role) |

## Roles and current permissions

- **Admin:** can access dashboard statistics and user administration, list all orders, update order status/notes, and manage any product.
- **Seller:** product records support a seller owner. The product controller allows the owner to update/delete their own product. The current client does not provide a separate seller dashboard, and the create-product API does not currently enforce the seller role.
- **Customer (`user`):** registration creates this role by default. An authenticated customer can create an order through the API and view their own orders. The supplied client does not include a complete customer storefront or checkout flow.

## Main source structure

```text
server/
├── server.js
└── src/
    ├── app.js
    ├── config/          # environment configuration and MongoDB connection
    ├── controllers/     # request handlers
    ├── middlewares/     # authentication, admin checks, error handling
    ├── models/          # User, Product, Order schemas
    ├── routes/          # auth, product, order, dashboard, user routes
    ├── services/        # token and ImageKit services
    ├── utils/           # API error helper
    └── validators/      # request validation
```

## Security and deployment checklist

- Use strong, unique access/refresh token secrets.
- Never commit `.env` or private API keys.
- Set `CLIENT_URL` to the exact deployed client origin and configure CORS accordingly.
- Use HTTPS in production; verify cookie settings for your hosting domains.
- Enforce role checks on product creation and protect all admin-only endpoints server-side.
- Review route ordering and test each endpoint before deployment.
- The frontend API URL is currently hard-coded in `client/src/services/api.js`; update it for production.
