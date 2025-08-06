# Mediflow API Documentation

## Table of Contents
- [Authentication](#authentication)
- [User Management](#user-management)
- [Doctors](#doctors)
- [Patients](#patients)
- [Prescriptions](#prescriptions)
- [File Uploads](#file-uploads)
- [AI Assistant](#ai-assistant)

## Authentication

### Login
- **POST** `/login`
  - Description: Authenticate a user
  - Request Body:
    ```json
    {
      "email": "string",
      "password": "string"
    }
    ```
  - Response: JWT token and user details

### Google Authentication
- **POST** `/google-auth`
  - Description: Authenticate or register a user using Google OAuth
  - Request Body:
    ```json
    {
      "token": "google_id_token"
    }
    ```
  - Response: JWT token and user details

- **PUT** `/google-auth/complete`
  - Description: Complete Google signup by adding additional user info
  - Headers: `Authorization: Bearer <jwt_token>`
  - Request Body:
    ```json
    {
      "username": "string",
      "role": "doctor|patient|receptionist",
      "registrationNumber": "string" // required if role is doctor
    }
    ```

## User Management

### Send Verification Code
- **POST** `/signup/send-code`
  - Description: Send verification code to email for signup
  - Request Body:
    ```json
    {
      "email": "string"
    }
    ```

### User Registration
- **POST** `/signup`
  - Description: Register a new user
  - Request Body:
    ```json
    {
      "name": "string",
      "email": "string",
      "password": "string",
      "role": "doctor|patient|receptionist",
      "registrationNumber": "string", // required if role is doctor
      "code": "string" // verification code
    }
    ```

### Password Reset
- **POST** `/login/reset-code`
  - Description: Request password reset code
  - Request Body:
    ```json
    {
      "email": "string"
    }
    ```

- **POST** `/login/reset-password`
  - Description: Reset password using verification code
  - Request Body:
    ```json
    {
      "email": "string",
      "code": "string",
      "newPassword": "string"
    }
    ```

## Doctors

### Get Doctor Details
- **GET** `/doctor/detailes/:id`
  - Description: Get details of a specific doctor
  - Response: Doctor details object

### Update Receptionist
- **PUT** `/doctor/receptionist`
  - Description: Assign a receptionist to a doctor
  - Headers: `Authorization: Bearer <jwt_token>`
  - Request Body:
    ```json
    {
      "receptionistId": "string"
    }
    ```

## Patients

### Get Patient Details
- **GET** `/patient/details?patientId=<id>`
  - Description: Get details of a specific patient
  - Headers: `Authorization: Bearer <jwt_token>`
  - Query Params:
    - `patientId`: ID of the patient

### Manage Access List
- **GET** `/patient/accesslist`
  - Description: Get list of doctors with access to patient's records
  - Headers: `Authorization: Bearer <jwt_token>`

- **POST** `/patient/doc`
  - Description: Add a doctor to patient's access list
  - Headers: `Authorization: Bearer <jwt_token>`
  - Request Body:
    ```json
    {
      "doctorId": "string"
    }
    ```

- **DELETE** `/patient/doc/:doctorId`
  - Description: Remove a doctor from patient's access list
  - Headers: `Authorization: Bearer <jwt_token>`
  - URL Params:
    - `doctorId`: ID of the doctor to remove

### File Management
- **GET** `/patient/files`
  - Description: Get list of patient's uploaded files
  - Headers: `Authorization: Bearer <jwt_token>`

- **DELETE** `/patient/file/:fileId`
  - Description: Delete a patient's file
  - Headers: `Authorization: Bearer <jwt_token>`
  - URL Params:
    - `fileId`: ID of the file to delete

## Prescriptions

### Get Prescriptions
- **GET** `/prescription`
  - Description: Get list of user's prescriptions
  - Headers: `Authorization: Bearer <jwt_token>`

### Update Prescription Status
- **PUT** `/prescription/:id`
  - Description: Update status of a prescription
  - Headers: `Authorization: Bearer <jwt_token>`
  - URL Params:
    - `id`: ID of the prescription
  - Request Body:
    ```json
    {
      "status": "Active|Completed"
    }
    ```

### Delete Prescription
- **DELETE** `/prescription/:id`
  - Description: Delete a prescription
  - Headers: `Authorization: Bearer <jwt_token>`
  - URL Params:
    - `id`: ID of the prescription to delete

## File Uploads

### Upload File
- **POST** `/upload`
  - Description: Upload a file (PDF or Image)
  - Headers: 
    - `Authorization: Bearer <jwt_token>`
    - `Content-Type: multipart/form-data`
  - Form Data:
    - `file`: The file to upload
    - `filename`: Name of the file

### Upload Audio
- **POST** `/upload/audio`
  - Description: Upload an audio file for prescriptions
  - Headers: 
    - `Authorization: Bearer <jwt_token>`
    - `Content-Type: multipart/form-data`
  - Form Data:
    - `audio`: The audio file to upload
    - `filename`: Name of the audio file

## AI Assistant

### Ask Question
- **POST** `/ai/ask`
  - Description: Get AI-generated response about medications
  - Headers: `Authorization: Bearer <jwt_token>`
  - Request Body:
    ```json
    {
      "text": "string",
      "context": ["string"] // optional additional context
    }
    ```
  - Response: AI-generated text response