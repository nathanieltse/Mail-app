from django.contrib import admin

from .models import *
# Register your models here.


class user_list(admin.ModelAdmin):
    list_display = ('id','email')

class mail(admin.ModelAdmin):
    listin_display = ("id","sender","recipients","subject","body","timestamp","read", "archived")

admin.site.register(User, user_list),
admin.site.register(Email, mail)
