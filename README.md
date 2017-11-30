github-local-backup
===================
`glb` backs up Github repositories to your local filesystem.

Installing
----------
`glb` can be installed via `npm`:

```
[sudo] npm install [-g] github-local-backup
```

After installing, a `glb` executable will reside on your `PATH`.


Configuring
-----------
`glb` requires that `git` be installed on your system `PATH`. In order to
minimize configuration, `glb` works by simply defering to `git` on the shell.


Usage
-----
### Backing up a list of repositories ###
`glb` accepts a list of newline-delimited URLs on `stdin` and downloads the
specified repositories to `<target-dir>`.

```sh
# repos.txt contains a list of repository URLs
user@host:~$ cat ~/desktop/repos.txt
git@github.com:john-doe/alpha.git
git@github.com:john-doe/bravo.git
git@github.com:jane-doe/charlie.git

# pipe repos.txt into stdin
user@host:~$ cat ~/desktop/repos.txt | glb download ~/src/github-backup
```

Repositories will be grouped by username to prevent namespace conflicts:
```sh
user@host:~$ tree ~/src/github-backup
github-backup
├── john-doe
│   ├── alpha
|   └── bravo
└── jane-doe
    └── charlie
```

Repositories that are absent from `<target-dir>` will be downloaded locally via
`git clone`. Repositories that are present in `<target-dir>` will be updated
via `git pull --all`.


### Discovering repositories on Github ###
If provided with a [Github Personal API token][token], `glb` can generate a
list of all repositories to which a given account has access:

```sh
user@host:~$ glb discover $TOKEN
git@github.com:john-doe/alpha.git
git@github.com:john-doe/bravo.git
git@github.com:jane-doe/charlie.git
```

### Backing up all repositories on Github ###
`glb discover` and `glb download` may be chained to back up all of your Github
repositories:

```sh
user@host:~$ glb discover $TOKEN | glb download ~/src/github-backup
```

[token]: https://github.com/blog/1509-personal-api-tokens
