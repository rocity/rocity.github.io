## Angular 2.x and Django

I've been working with Angular 2.x for about a couple of months now.
Everytime I setup a new project, I always look for the same interceptor code I created for my old projects.

```
import { Injectable, NgModule} from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest} from '@angular/common/http';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';

@Injectable()
export class HttpsRequestInterceptor implements HttpInterceptor {
  constructor(private cookieService: CookieService) {

  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.cookieService.get('csrftoken');
    const dupReq = req.clone({ headers: req.headers.set('X-CSRFToken', token) });
    return next.handle(dupReq);
  }
};
@NgModule({
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: HttpsRequestInterceptor, multi: true }
  ]
})
export class InterceptorModule { }
```

Nothing fancy here, just a plain interceptor. I based this code on how our company handled setting up CSRF tokens on headers with
Angular 1.x projects. Fetch the csrftoken cookie, take the token there, slap it on every request the AngularJS app is sending to the API.

Easy peasy, lemon squeezy.

Now, jumping onto Angular 2, there are far more less code samples on the web. I couldn't find a single best way of setting up the CSRF header for my app.
Hence I read a ton of documentation and applied our old method. The result would be that 24-line spaghetti above.

I gotta admit, it is **VERY** bulky for such a simple task. The first time I came up with it, I was disappointed.

> Ugh. This much boilerplate just to slap a < 30 character token to my http headers? What garbage is this?

It was frustrating. Or is it?

It turns out, I just wasn't looking hard enough.

I present to you, [The Angular Docs' HttpClient Security Section](https://angular.io/guide/http#security-xsrf-protection).

It tells us that we only need **4 LINES** to take our token from the cookie, slap it in our headers, and use it on all of our http requests.

_HOW FREAKIN' NIFTY_

Just add this to your `AppModule`'s `imports` array. Works like a charm.

```
HttpClientXsrfModule.withConfig({
  cookieName: 'csrftoken',
  headerName: 'X-CSRFToken',
}),
```
