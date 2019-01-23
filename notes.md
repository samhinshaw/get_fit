## Notes

### Authentication Cookies

To get a url with authentication, we just need to pass the authentication cookie! Get the authentication cookie from an authenticated session with browser dev tools: [Application] -> [Cookies], and replace `<cookie string>` with the value, and (if necessary), `connect.sid` with the cookie name.

For `curl`:

```
curl --cookie "connect.sid=<cookie string>" http://localhost:8005/user
```

For ApacheBench (`ab`):

```
ab -k -c 20 -n 250 -C "connect.sid=<cookie string>" "http://localhost:8005/user"
```

### GPG Signing

Check out [this reference](https://gist.github.com/danieleggert/b029d44d4a54b328c0bac65d46ba4c65) for signing commits with GPG keys. Note that to get the pinentry program to prompt you for your passphrase, you need to OMIT the line `no-tty`!!
