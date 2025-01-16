# == Notes for myself ==
## How to setup and tinker with a Django wep app
This is so that I won't forget how to do this in the furture.

## Table of Contents
1. [How to setup and tinker with a Django web app](#how-to-setup-and-tinker-with-a-django-web-app)
2. [Process](#process)
    1. [Django Project setup](#django-project-setup)
    2. [Django App setup](#django-app-setup)
    3. [Add URLs to Your Django Project](#add-urls-to-your-django-project)
    4. [Define a View](#define-a-view)
    5. [Basic database setup](#basic-database-setup)
3. [Start the server](#start-the-server)
4. [Create superuser](#create-superuser)

# Process:
### Django Project setup
- `pip install django`
- `django-admin startproject project_name`
=> **it will create a project of this structure**:
```
myproject/
├── manage.py
├── myproject/
│   ├── __init__.py
│   ├── settings.py
│   ├── urls.py
│   ├── asgi.py
│   └── wsgi.py
```
- Navigate to project :
    - `cd project_name`
### Django App setup
Run this: 
- `python manage.py startapp app_name`

- Add the App to Installed Apps: 
    - Open the `settings.py` file in the
    `project_folder/project_name/` directory and add `app_name` to the section bellow.
``` python
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'app_name',  # Add this line
]
```
#####  Add URLs to Your Django Project
- Setting up `urls.py` in the Project:

Open project_name/urls.py and include the URLs from the `[app_name]` app. You need to import the include function and link it to the app’s URL configuration:

```python
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path("", include("app.urls"))
]
```
Quick explainer: 

```
path("", include("app.urls")) will forward the URLS from something like website.com/

to your app URLS.

if you do path("app_name/", include("app.urls"))

you will have to go to website.com/app_name

to access your app and any further extension like

website.com/app_name/admin will be handled by the app.
```

- Create a `urls.py` file inside the `app_name` directory

here's an example of urls.py
```python
from django.urls import path
from . import views

urlpatterns = [
    path('login/', views.login_view, name='login'),
    path('', views.home, name='home'),   
    path('logout/', views.logout_view, name='logout'),
    path('home/', views.home, name='home'),
]
```
Quick explainer:
- if you included an exntendsion to your site- in your project urls.py, `website.com/app_name`, when you visit `website.com/app_name/home`, according to the snipet above, home/ will render the home view, and run the function named `home`. We'll get into this soon.

#### Define a View

- In the views.py file inside the `app_name` directory, define a simple view:

```python
from django.http import HttpResponse

def home(request):
    return HttpResponse("Hello, world! Welcome to my Django app.")
```
 this will render just an empty website that says 
 `"Hello, world! Welcome to by Django app."`

- For most cases, we will render out a HTML template. like this

```python
from django.shortcuts import render

def home(request):
    return render(request, 'base.html')
```
when you enter website.com/app_name/home
it will render out base.html.
**Note**: all HTMLs should be stored in `app_name/templates` directory.

#### Baisc data base setup.
- go to `models.py` in your `app_name` directory. Add in any data structure you'd want. start by writing:
```python
Class model_name(models.Model):
    date = models.DateTimeField
    task_name = models.CharField(max_length=100)
```
Example:
```python 
# models.py
from django.contrib.auth.models import User
from django.db import models

class Case(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    total_duration = models.DurationField(default=datetime.timedelta)

class Log(models.Model):
    case = models.ForeignKey(Case, on_delete=models.CASCADE)
    duration = models.DurationField()
    date = models.DateTimeField(auto_now_add=True)
```
- After you have added your data base models, run these 2 commands:
    - ```python manage.py makemigrations```   
    - ```python manage.py migrate```

#### Start the server by running
- `python manage.py runserver`
#### Create super user
- `python .\manage.py createsuperuser`
