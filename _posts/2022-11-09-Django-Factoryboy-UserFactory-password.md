# Django Factoryboy UserFactory password


I keep forgetting how to set this, so I'll immortalize it here.

```python
class UserFactory(factory.django.DjangoModelFactory):

    class Meta:
        model = User
    password = factory.PostGenerationMethodCall('set_password', 'password')
```

[SO Answer](https://stackoverflow.com/a/20593098/2331182)
