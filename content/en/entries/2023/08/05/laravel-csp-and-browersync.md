---
title: Running injected scripts in your web app with CSP enabled
description: How to run injected scripts with strict Content Security Policy (CSP) headers enabled, without compromising on security.
author: Bjørnar Hagen
categories:
  - Code
  - Security
posterImage: /entries/2023/08/05/header.jpg
posterImageCredits: null
posterImageSize: sm
publishDate: 2023-08-05T11:15:00.000Z
summary: How to run injected scripts with strict Content Security Policy (CSP) headers enabled, without compromising on security.
body_id: post-page
body_classes: nav-small
---

If you have CSP enabled in your web app you might have ran into the issue with injected scripts, like Browser Sync, getting blocked.
To fix this, we can find the sha384 hash of the script, and add it to our CSP header. This way we can keep our CSP header strict, and still have the injected scripts we want working.

In this post I will show you how to do this with Laravel CSP and Browser Sync, but the same principle applies to any other web app and injected script.

1. Install and setup <a href="https://github.com/spatie/laravel-csp" target="_blank">"Laravel CSP" from Spatie</a>.
2. Find the Browser Sync injected script.

```html
<script id="__bs_script__">
  //<![CDATA[
  ;(function () {
    try {
      var script = document.createElement('script')
      if ('async') {
        script.async = true
      }
      script.src = '/browser-sync/browser-sync-client.js?v=2.29.3'.replace('HOST', location.hostname)
      if (document.body) {
        document.body.appendChild(script)
      } else if (document.head) {
        document.head.appendChild(script)
      }
    } catch (e) {
      console.error('Browsersync: could not append script tag', e)
    }
  })()
  //]]>
</script>
```

3. Copy **everything inside** the script tag (even the `//<![CDATA[` stuff) and paste it into a file, for example `data.txt`.
   Make sure to save it exactly as copied, don't apply any formatting.
4. Now run the following command `cat data.txt | openssl dgst -sha384 -binary | openssl base64 -A`. I got this output `VJ54nlS+flZSG9OXg+tLU2fi0X9vUtpMr9KR3NuzNCwdV8HmZuVokdkiY4rFdohU`. Note that you might get a `%` at the end of the output. That's not part of the hash, it's just a indicator of no empty line ending, just remove it.
5. Add this hash to `src/app/Policies/GlobalCSPPolicy.php`, with `sha384-` prepended to it, like so:

```php
namespace App\Policies;

use Spatie\Csp\Directive;
use Spatie\Csp\Keyword;
use Spatie\Csp\Policies\Policy;

class GlobalCSPPolicy extends Policy {
  public function configure()
  {
    $this
      ->addDirective(Directive::BASE, Keyword::SELF)
      ->addDirective(Directive::SCRIPT, 'sha384-VJ54nlS+flZSG9OXg+tLU2fi0X9vUtpMr9KR3NuzNCwdV8HmZuVokdkiY4rFdohU') // Browser Sync 2.29.3
      ->addNonceForDirective(Directive::SCRIPT)
      ->addNonceForDirective(Directive::STYLE);
  }
}
```

That directive alone should give us a CSP header like this: `content-security-policy: script-src 'sha384-VJ54nlS+flZSG9OXg+tLU2fi0X9vUtpMr9KR3NuzNCwdV8HmZuVokdkiY4rFdohU';`

The complete example from above should look like this: `content-security-policy: base-uri 'self';script-src 'self' 'sha384-VJ54nlS+flZSG9OXg+tLU2fi0X9vUtpMr9KR3NuzNCwdV8HmZuVokdkiY4rFdohU' 'nonce-7CADofPhUXjXBMENRcHg3kVZEiLa0L4V';style-src 'self' 'nonce-7CADofPhUXjXBMENRcHg3kVZEiLa0L4V';`

With a CSP header like this, we can run injected scripts like Browser Sync, without compromising on security.

More info can be found here

- https://developer.mozilla.org/en-US/docs/Web/Security/Subresource_Integrity
- https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/script-src
