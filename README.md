
<p align="center">
    <img style="width: 96px; margin: 4em 0" src="frontend/public/favicon.png" alt="chunky logo" />
    <h1 align="center">chunky: A lightweight file sharing solution</h1>
</p>

**Preview:** (will change)
<p align="center">
  <img style="margin: 4em 0; max-width: 600px;" src="https://github.com/user-attachments/assets/994859d9-54ae-4dcc-ad7c-c30e96354d74" alt="chunky preview" />
</p>

**Developmend Progress:**
- [x] Chunked upload (using tus.io)
- [ ] Pausable / Resumable upload
- [ ] Drag & Drop support
- [x] Resumable download
- [x] Multiple file upload (buckets)
- [x] Multiple file download (zip)
- [x] Max File / Bucket size option
- [x] Light / Dark Mode
- [ ] File preview
- [x] Gallery view
- [x] Bucket / file expiration
- [x] One-time downloads
- [x] Admin Page
- [x] Upload Password
- [x] Bucket Password
- [ ] File encryption (Client side?)
- [x] Localization support (languages)


**Development:**
Requirement: NodeJS (20+)

```bash
# Clone repo
git clone https://github.com/Alkl58/chunky.git

# Run dev instance of frontend
$ cd frontend
$ npm install
$ npm run dev

# Run dev instance of backend
$ cd ..
$ npm install
$ npm run dev
```

**Attention!**
Make sure to create a `.env` file inside the root folder (same folder as `server.js`), which has to contain the following:
```env
PRIVATE_KEY="your-super-secret-key"
```
It is used to create secure tokens to prevent other users uploading to buckets of other users etc.

The following `.env` variables are optionally available:
```env
HOST="127.0.0.1"
PORT=4000
UPLOAD_DIRECTORY="uploads"
```
