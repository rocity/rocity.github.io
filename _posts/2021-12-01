# Django Admin - Conditional Fieldsets

```python
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin


class UserAdmin(BaseUserAdmin):
    list_display = ('id', 'email', 'is_staff', )

    def get_fieldsets(self, request, *args, **kwargs):
        if request.user.is_superuser:
            return (
                (None, {
                    'fields': (
                        'email', 'password', 'first_name', 'last_name', 'groups', 'is_active', 'is_superuser',
                        'is_staff', 'last_login', 'user_permissions',
                    ),
                }),
            )
        return (
            (None, {
                'fields': (
                    'first_name', 'last_name',
                )
            }),
        )
```

Overriding `django.contrib.admin.ModelAdmin`'s `get_fieldsets` method can give you the power to apply conditions on what fieldsets to show to specific users.
