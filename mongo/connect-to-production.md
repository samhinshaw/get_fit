# Connect to Production Database on MongoDB Atlas

1. Log in to [MongoDB Atlas](https://cloud.mongodb.com/user#/atlas/login)
2. Go to the security tab and temporarily allow connections from anywhere (IP whitelist).
3. Back on the clusters tab, click connect and get the mongo shell connection string.
4. Paste the mongo connection string into your terminal, replacing your username.
5. Input your urlencoded password when prompted. If you need to urlencode your password, you can use Python:
   ```py
   # python 2
   import urllib
   urllib.quote_plus('p@ssword')
   # python 3
   import urllib
   urllib.parse.quote_plus('p@ssword')
   ```
6. Switch dbs (`use get_fit`) and get querying!
7. For safety, remove the IP whitelist after you have finished.
