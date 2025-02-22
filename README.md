
<p align="center">
    <img style="width: 96px; margin: 4em 0" src="frontend/public/favicon.png" alt="chunky logo" />
    <h1 align="center">chunky: A lightweight file sharing solution</h1>
</p>

**Preview:** (will change)
<p align="center">
  <img style="margin: 4em 0" src="https://github.com/user-attachments/assets/59e87b55-c3a7-4837-97bf-36fab91846fa" alt="chunky preview" />
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
- [ ] Gallery view
- [x] Bucket / file expiration
- [ ] One-time downloads
- [ ] Admin Page
- [ ] Upload Password / tokens
- [x] Bucket Password
- [ ] File encryption (Client side?)
- [ ] Localization (languages)


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
