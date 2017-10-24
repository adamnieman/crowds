
# Crowds

Visualises what statistically grouped categories of people would physically look like if stood in a crowd, separated by category. 

## Installation

This project depends on the https://github.com/realworldvisuals/crowd-generator repo for a JSON feed. Clone the crowd-generator repo to a location on the server (eg. /var/www/crowd-generator) and create a symlink to `crowd-JSON.php` in the document root (the `/public` folder).

```
ln -s ../../crowd-generator/crowd-JSON.php crowd-JSON.php
```

The name you use for the symlink must match the `crowd_request_url` setting in settings.json
