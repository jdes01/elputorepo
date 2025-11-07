#!/bin/sh
set -e

DIR="$(cd "$(dirname "$0")" && pwd)"

npm run format
npm run lint -- --fix


