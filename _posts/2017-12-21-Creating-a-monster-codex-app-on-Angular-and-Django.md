# Creating a monster codex app on Angular and Django

*Tempted to call this app Pokedex for old time's sake.*

This will guide you through setting up Angular 5 to run together with a Django backend.

First, let's identify **Angular** and **Django**'s role in our development process.

I assume that you are an entry-level developer/hobbyist just like me and use these technologies (although this guide _could_ also be useful to more advanced people):

- Linux/macOS
- Python 3
- Node 6.9 or higher
- NPM 3.10 or higher

### Django

Django will be our back-end. It will handle our business logic and our database operations. It will contain the template that will hold our _Angular_ app's source code too. This template will be used on a single webpage by our _Django_ app.

### Angular

Angular will be our front-end. It will handle our presentation logic. Everything that the end-user will do in the browser will be covered by Angular. Adding *Monsters*, editing *Monsters*, viewing *Monsters*, all on his/her web browser. Stuff like that.

#### Aight.

With both both technologies identified, let's get on with it!

![onwards!](https://media.giphy.com/media/W6vq5qLStzYys/giphy.gif)

## Django Setup

To prevent blowing up our OS's Python installation, we'll use virtualenv to handle our development environment. Read more about virtualenv [here](https://pypi.python.org/pypi/virtualenv).

If you already have virtualenv installed, go ahead and create one:

```
$ virtualenv -p python3 venv
```

Once that's set, activate it and then install *Django*.

```
$ source venv/bin/activate
(venv) $ pip install django==2.0
```

*Note: the `(venv)` prefix in your console signifies that the virtualenv is activated.*

With your virtualenv active, create the *Django* project:

```
(venv) $ django-admin.py startproject monsterdb
```

Once the project gets created, your directory should now look like this:

```
projects  -\
			|- venv\
			|- monsterdb -\
						   |- manage.py
						   |- monsterdb -\
										  |- __init__.py
										  |- settings.py
										  |- urls.py
										  |- wsgi.py

```

Let's create a *Django* app to keep things organized:

*Note:* `cd` into the directory where the `manage.py` file is located before issuing these commands:

```
python manage.py startapp monster
```

This will create our app where we will put our `API` endpoints and business logic.

Still on that directory (let's call this directory, where the `manage.py` file resides, the **PROJECT ROOT DIRECTORY**), create a folder and name it `templates`.

In the templates folder, create an html file and name it `base.html`.

Sample `base.html` code:

**monsterdb/monsterdb/templates/base.html**
```
<!DOCTYPE html>
<html>
<head>
    <title>MonsterDB</title>
</head>
<body>
    <h1>Hello world!</h1>
</body>
</html>
```

Let's set-up our template settings so that *Django* will be able to find our newly created webpage.

Open `monsterdb/settings.py` and find the `TEMPLATES` variable. Change its `DIRS` property to contain the path to our templates folder: `os.path.join(BASE_DIR, 'templates')`.

`TEMPLATES` should now look like this:

**monsterdb/monsterdb/settings.py**
```
TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [os.path.join(BASE_DIR, 'templates'), ],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]
```

Next, let's create our first `route`. `routes` are URLs that an end-user can access in a web-browser to access our webapp.

Open up `monsterdb/urls.py` (the project's main `urls.py` file) and add this route:

`re_path(r'^(.*)$', TemplateView.as_view(template_name="base.html"))`

This will point all url matches to our html file.

**monsterdb/monsterdb/urls.py**
```
from django.contrib import admin
from django.urls import path, re_path

from django.views.generic import TemplateView


urlpatterns = [
    path('admin/', admin.site.urls),
    re_path(r'^(.*)$', TemplateView.as_view(template_name="base.html")),
]

```

Next is our static (CSS/JS/Images) files.

In the **PROJECT ROOT DIRECTORY**, create a folder and name it `assets`.

inside assets, create a file called `styles.css` and paste this code in it:

```
* {
  font-family: sans-serif;
}

h1 {
  color: #16a085;
}
```

After creating our base css file, edit `monsterdb/settings.py` again. Add these lines of code in:
```
STATICFILES_DIRS = [
    os.path.join(BASE_DIR, 'assets'),
]

STATIC_URL = '/static/'
```

Next, let's add our css file to our webpage.

On the very top of `monsterdb/templates/base.html`, load our staticfiles:

```html
{\% load staticfiles \%}
```

This will enable the usage of *Django*'s `{% static %}` template tag.

Once staticfiles are enabled, add our css file inside the `<head>` tag.

```html
<link rel="stylesheet" type="text/css" href="{% static 'styles.css' %}">
```

You can check this out by running your development server (`python manage.py runserver`) and visiting `http://127.0.0.1:8000`.

A page with a teal "Hello world!" should greet you.

![next](https://media.giphy.com/media/l2QE9DnrGooBbU4vu/giphy.gif)

## Angular Setup

*Note: it is recommended to open another terminal window for this task while your Django development server is running on the other one.*

You should already have Node and  NPM installed.

If you already have them, install Angular's CLI tool:

```
$ npm install -g @angular/cli
```

Next, let's create a folder inside our *Django* assets to contain our *Angular* app.

From the `assets` folder, create a new folder and name it `scripts`. `cd` to our newly created `scripts` folder and run:

```
$ ng new monsterdb
```

Angular CLI will generate the seed files to our app and install the necessary packages. Sit back as it might take a few minutes.

Let's call this directory, where the `.angular-cli.json` and `package.json` resides, the **WEBAPP ROOT DIRECTORY**.

While in this directory, let's try building the webapp:

```
ng build --watch
```

This will compile our angular app into JavaScript files inside the `dist` folder of our **WEBAPP ROOT DIRECTORY**.

If successful, the terminal should output the built files:

![output](https://i.imgur.com/V6MyFDV.png)

Our *Angular* app is now built. Let's attach the built files into our *Django* template now.

Open up `templates/base.html` and replace it with this code:


**monsterdb/monsterdb/templates/base.html**
```html
{% load staticfiles %}
<!DOCTYPE html>
<html>
<head>
  <title>MonsterDB</title>

  <base href="/">
</head>
<body>
  <app-root></app-root>

  <script type="text/javascript" src="{% static 'scripts/monsterdb/dist/inline.bundle.js' %}"></script>
  <script type="text/javascript" src="{% static 'scripts/monsterdb/dist/polyfills.bundle.js' %}"></script>
  <script type="text/javascript" src="{% static 'scripts/monsterdb/dist/styles.bundle.js' %}"></script>
  <script type="text/javascript" src="{% static 'scripts/monsterdb/dist/vendor.bundle.js' %}"></script>
  <script type="text/javascript" src="{% static 'scripts/monsterdb/dist/main.bundle.js' %}"></script>

</body>
</html>
```

That should attach our built files to the webpage and run our *Angular* app.

Visit `http://127.0.0.1:8000` and you should see the running *Angular* app, hosted on our `Django` app..

![webapp](https://i.imgur.com/oje8C4d.png)

### Setup Complete

In the next blog post, we will tackle building an API and the components for our Monster codex app.
