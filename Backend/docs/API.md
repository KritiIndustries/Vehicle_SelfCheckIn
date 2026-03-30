# Vehicle SelfCheckIn — API Documentation

Base URL: `https://<HOST>/api` (adjust per environment)

Auth:

- Guard endpoints use JWT: `Authorization: Bearer <token>` returned by `/api/auth/verify-otp`.
- Weighbridge endpoint uses HTTP Basic auth (username: `prdadmin`, password: `kriti@555`).

Response format:

- Success: JSON matching `ApiResponse` { statusCode, data, message, success, count }
- Errors: JSON matching `ApiError` { statusCode, data: null, message, success: false, errors }

---

## Authentication

### POST /api/auth/send-otp

- Description: Request an OTP for a guard to log in.
- Request (application/json): { "phone": "<mobile_number>" }
- Responses:
  - 200: { success: true, message: "OTP sent successfully" }
  - 200: { success: false, message: "Guard not found!!" }
  - 400: missing phone

Example curl:

```
curl -X POST https://HOST/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"phone":"9876543210"}'
```

### POST /api/auth/verify-otp

- Description: Verify OTP and receive JWT token.
- Request (application/json): { "phone": "<mobile>", "otp": "<4-digit>" }
- Responses:
  - 200: ApiResponse with data { token: "<jwt>" }
  - 400/401/404: appropriate ApiError

Example curl:

```
curl -X POST https://HOST/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"phone":"9876543210","otp":"1234"}'
```

---

## Driver APIs (base: `/api/driver`)

### POST /api/driver/upload-doc and /api/driver/upload-docs

- Description: Upload multiple documents (up to 4). Both routes map to the same handler.
- Authentication: none
- Request: multipart/form-data
  - files: `documents` (array, max 4)
  - fields: `sessionId` (string), `doNumber` (string), `types` (JSON array of doc types matching files order)
- Allowed types: `dl`, `license`, `rc`, `insurance`, `fitness`, `selfie`
- Response: 200 ApiResponse with uploaded file URLs and OCR results

Example curl (single file example):

```
curl -X POST https://HOST/api/driver/upload-doc \
  -F "sessionId=abc123" \
  -F "doNumber=DO001" \
  -F 'types=["dl","rc"]' \
  -F "documents=@/path/to/dl.jpg" \
  -F "documents=@/path/to/rc.jpg"
```

### POST /api/driver/upload-selfie

- Description: Upload driver selfie and validate vehicle number via OCR.
- Request: multipart/form-data
  - file: `selfie` (single)
  - fields: `sessionId` (string), `doNumber` (string), `vehicleNo` (string)
- Response: 200 ApiResponse { fileUrl, detectedVehicleNo }

### POST /api/driver/finalize

- Description: Finalize and create check-in record after documents uploaded and verified.
- Request (application/json):
  {
  "sessionId": "string",
  "doNo": "string",
  "vehicleNo": "string",
  "driverName": "string",
  "mobile": "string",
  "lrNumber": "string (optional)",
  "documentDetails": { dl, rc, insurance, fitness }
  }
- Response: 201 ApiResponse with created `driver_Checkin` record
- Errors: 400 if missing fields, 409 if duplicate

Example curl:

```
curl -X POST https://HOST/api/driver/finalize \
  -H "Content-Type: application/json" \
  -d '{"sessionId":"s1","doNo":"DO1","vehicleNo":"MH12AA0001","driverName":"Ramesh","mobile":"9876543210","documentDetails":{}}'
```

### GET /api/driver/validatePage/:do

- Description: Check whether a DO has an active checkin (not CheckedOut).
- Params: `:do` (DO number)
- Response: 200 ApiResponse with checkin entry or 404

Example curl:

```
curl https://HOST/api/driver/validatePage/DO123
```

---

## Guard APIs (base: `/api/guard`)

### GET /api/guard/getCheckedinDetails

- Description: List current checked-in or report-in drivers with documents.
- Response: 200 ApiResponse with array of `driver_Checkin` records including `Documents` (Image_Path trimmed)

Example curl:

```
curl https://HOST/api/guard/getCheckedinDetails
```

### PATCH /api/guard/approve/:id

- Description: Approve an entry (posts to external ZGP API) and mark documents verified.
- Auth: JWT required (`Authorization: Bearer <token>`)
- Params: `:id` (checkin id)
- Response: 200 ApiResponse with updated checkin

Example curl:

```
curl -X PATCH https://HOST/api/guard/approve/123 \
  -H "Authorization: Bearer <token>"
```

### PATCH /api/guard/checkout/:id

- Description: Checkout vehicle (posts leave to ZGP) and set status to `CheckedOut`.
- Params: `:id` (checkin id)
- Response: 200 ApiResponse with updated checkin

### GET /api/guard/image/:folder/:subfolder/:filename

- Description: Proxy to S3 stored image. Returns image stream or 302/200 depending on configuration.
- Params: `folder`, `subfolder`, `filename`

Example curl:

```
curl https://HOST/api/guard/image/xyz/abc/img.jpg
```

---

## Weighbridge API

### POST /api/weighbridge

- Description: Create or update weighbridge entry. Uses `basicAuth` middleware.
- Auth: Basic auth (username: `prdadmin`, password: `kriti@555`)
- Request (application/json):
  - For initial entry: { vehicleNo, tagNo, transporter, gatePassNo }
  - For final update: { ticketNo, grossWeight, tareWeight, gatePassNo, tolerances, shift }
- Responses:
  - 200: entry created / updated
  - 400: validation errors or already completed

Example curl (basic auth):

```
curl -u prdadmin:kriti@555 -X POST https://HOST/api/weighbridge \
  -H "Content-Type: application/json" \
  -d '{"vehicleNo":"MH12AA0001","tagNo":"TAG123","transporter":"ABC","gatePassNo":"GP123"}'
```

---

## Common error codes

- 400: Bad request / validation error
- 401: Unauthorized (missing/invalid JWT or Basic auth)
- 404: Not found
- 409: Conflict (duplicate resource)
- 500: Server / integration error (e.g., ZGP API failed)

---

## Next steps / Recommendations

- Add API request/response JSON schema examples (OpenAPI). See `openapi.yaml` alongside this file.
- Add authentication token expiry and refresh policy to security section.
- Add rate-limiting and CORS production settings.
