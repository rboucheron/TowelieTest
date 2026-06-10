from __future__ import annotations

import shutil
import shlex
import subprocess
from pathlib import Path

from invoke import task


ROOT = Path(__file__).resolve().parent
APP_SERVICE = "app"
JWT_DIR = ROOT / "config" / "jwt"
PRIVATE_KEY = JWT_DIR / "private.pem"
PUBLIC_KEY = JWT_DIR / "public.pem"
ENV_FILE = ROOT / ".env"
TEST_ENV_FILE = ROOT / ".env.test"
NPM_AVAILABLE = shutil.which("npm") is not None

DEV_ENV = """APP_ENV=dev
APP_DEBUG=1
APP_SECRET=8d4b4ef08f7f4d56b5d6e4b2f8b6a8d2
DATABASE_URL="postgresql://app:app@database:5432/towelie?serverVersion=16&charset=utf8"
MAILER_DSN=null://null
MESSENGER_TRANSPORT_DSN=sync://
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
JWT_PASSPHRASE=changeit
"""

TEST_ENV = """APP_ENV=test
APP_DEBUG=0
APP_SECRET=8d4b4ef08f7f4d56b5d6e4b2f8b6a8d2
DATABASE_URL="postgresql://app:app@127.0.0.1:5432/towelie_test?serverVersion=16&charset=utf8"
MAILER_DSN=null://null
MESSENGER_TRANSPORT_DSN=sync://
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
JWT_PASSPHRASE=changeit
"""


def _compose_base() -> list[str]:
    if shutil.which("docker-compose") is not None:
        return ["docker-compose"]

    return ["docker", "compose"]


def _write_if_missing(path: Path, content: str) -> bool:
    if path.exists():
        return False

    path.write_text(content, encoding="utf-8")
    return True


def _compose_command(*args: str) -> list[str]:
    return _compose_base() + list(args)


def _run(context, *args: str) -> None:
    command = " ".join(shlex.quote(part) for part in args)
    context.run(command, pty=True, cwd=str(ROOT))


def _run_in_app(command: str) -> None:
    subprocess.run(
        _compose_base() + ["exec", "-T", APP_SERVICE, "sh", "-lc", command],
        cwd=ROOT,
        check=True,
    )


def _has_migrations() -> bool:
    migrations_dir = ROOT / "migrations"
    return migrations_dir.exists() and any(migrations_dir.glob("*.php"))


def _ensure_env_files() -> None:
    _write_if_missing(ENV_FILE, DEV_ENV)
    _write_if_missing(TEST_ENV_FILE, TEST_ENV)


def _ensure_jwt_keys() -> None:
    JWT_DIR.mkdir(parents=True, exist_ok=True)

    if PRIVATE_KEY.exists() and PUBLIC_KEY.exists():
        return

    _run_in_app(
        'umask 0077 && mkdir -p config/jwt && '
        'openssl genpkey -aes-256-cbc -pass pass:"$JWT_PASSPHRASE" '
        '-out config/jwt/private.pem -algorithm rsa -pkeyopt rsa_keygen_bits:4096 && '
        'openssl pkey -in config/jwt/private.pem -passin pass:"$JWT_PASSPHRASE" '
        '-pubout -out config/jwt/public.pem'
    )


def _install_frontend_dependencies(context) -> None:
    if not NPM_AVAILABLE:
        print("npm not found, skipping frontend dependency installation")
        return

    context.run("npm install", pty=True, cwd=str(ROOT))
    context.run("npm run build", pty=True, cwd=str(ROOT))


@task
def setup(context):
    _ensure_env_files()
    _run(context, *(_compose_command("up", "-d", "--build")))
    _run_in_app("composer install --no-interaction --prefer-dist")
    _ensure_jwt_keys()
    _run_in_app("php bin/console doctrine:database:create --if-not-exists --no-interaction")

    if _has_migrations():
        _run_in_app("php bin/console doctrine:migrations:migrate --no-interaction")
    else:
        _run_in_app("php bin/console doctrine:schema:update --force --complete --no-interaction")

    _install_frontend_dependencies(context)


@task
def up(context, build=False):
    command = _compose_command("up", "-d")
    if build:
        command.append("--build")

    _run(context, *command)


@task
def down(context):
    _run(context, *(_compose_command("down")))


@task
def restart(context):
    _run(context, *(_compose_command("restart")))


@task
def logs(context, service=""):
    command = _compose_command("logs", "-f")
    if service:
        command.append(service)

    _run(context, *command)


@task
def console(context, args=""):
    command = ["docker", "compose", "exec", "-T", APP_SERVICE, "php", "bin/console"]
    if args:
        command.extend(shlex.split(args))

    _run(context, *command)


@task
def composer(context, args="install --no-interaction --prefer-dist"):
    command = _compose_base() + ["run", "--rm", "--no-deps", APP_SERVICE, "composer"]
    command.extend(shlex.split(args))
    _run(context, *command)


@task
def migrate(context):
    if _has_migrations():
        _run_in_app("php bin/console doctrine:migrations:migrate --no-interaction")
    else:
        _run_in_app("php bin/console doctrine:schema:update --force --complete --no-interaction")