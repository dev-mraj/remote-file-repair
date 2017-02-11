***Remote File Repair***

This is simple programme to repaid any downloaded file
which is also available on your server, simply by checking file peaces hash. 
because sometimes its not possible to download big files again.

**Usages:**

put your file in public folder for both server and client

On Server Machine 

`node server.js`

On Local Machine

`node repair.js local_file.iso remote_file_name.iso remote_server.com:3561`


**TODO::**
1. resume download if file size is different, right now its can only repair same size of remote and local file

