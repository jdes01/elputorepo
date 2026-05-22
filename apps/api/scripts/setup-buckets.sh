#!/usr/bin/env bash

set -euo pipefail

#######################################
# CONFIGURACIÓN
#######################################

# Lista de buckets (SIN prefijo)
BUCKETS=(
  "event-images"
)

#######################################
# FUNCIONES
#######################################

usage() {
  echo "Usage:"
  echo "  AWS real:"
  echo "    $0 -e <environment> -r <region> [--aws-access-key <key> --aws-secret-key <secret> --aws-session-token <token>]"
  echo
  echo "  LocalStack:"
  echo "    $0 --localstack"
  exit 1
}

bucket_exists() {
  local bucket="$1"
  $AWS_CMD s3api head-bucket --bucket "$bucket" 2>/dev/null
}

create_bucket() {
  local bucket="$1"

  if bucket_exists "$bucket"; then
    echo "⚠️  Bucket ya existe: $bucket"
    return
  fi

  echo "🪣 Creando bucket: $bucket"

  if [[ "$REGION" == "us-east-1" ]]; then
    $AWS_CMD s3api create-bucket --bucket "$bucket"
  else
    $AWS_CMD s3api create-bucket \
      --bucket "$bucket" \
      --region "$REGION" \
      --create-bucket-configuration LocationConstraint="$REGION"
  fi
}

#######################################
# PARÁMETROS
#######################################

ENVIRONMENT=""
REGION=""
LOCALSTACK=false
AWS_ACCESS_KEY=""
AWS_SECRET_KEY=""
AWS_SESSION_TOKEN=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    -e) ENVIRONMENT="$2"; shift 2 ;;
    -r) REGION="$2"; shift 2 ;;
    --localstack) LOCALSTACK=true; shift ;;
    --aws-access-key) AWS_ACCESS_KEY="$2"; shift 2 ;;
    --aws-secret-key) AWS_SECRET_KEY="$2"; shift 2 ;;
    --aws-session-token) AWS_SESSION_TOKEN="$2"; shift 2 ;;
    *) usage ;;
  esac
done

#######################################
# VALIDACIÓN
#######################################

if [[ "$LOCALSTACK" == true ]]; then
  if [[ -n "$ENVIRONMENT" || -n "$REGION" ]]; then
    echo "❌ No mezclar --localstack con -e / -r"
    exit 1
  fi
  ENVIRONMENT="local"
  REGION="us-east-1"
else
  if [[ -z "$ENVIRONMENT" || -z "$REGION" ]]; then
    usage
  fi
fi

#######################################
# AWS CLI CHECK
#######################################

if ! command -v aws >/dev/null 2>&1; then
  echo "❌ aws CLI no está instalado o no está en el PATH"
  echo "   Instala AWS CLI en este contenedor o entorno"
  exit 1
fi

#######################################
# CONFIGURAR AWS CLI
#######################################

# Export variables si se pasaron explícitamente
[[ -n "$AWS_ACCESS_KEY" ]] && export AWS_ACCESS_KEY_ID="$AWS_ACCESS_KEY"
[[ -n "$AWS_SECRET_KEY" ]] && export AWS_SECRET_ACCESS_KEY="$AWS_SECRET_KEY"
[[ -n "$AWS_SESSION_TOKEN" ]] && export AWS_SESSION_TOKEN="$AWS_SESSION_TOKEN"
export AWS_DEFAULT_REGION="$REGION"

# Comando base
AWS_CMD="aws"
if [[ "$LOCALSTACK" == true ]]; then
  echo "⚙️  Usando LocalStack"
  AWS_CMD="aws --endpoint-url=http://localstack:4566"
fi

#######################################
# EJECUCIÓN
#######################################

echo "🚀 Creando buckets"
echo "🌍 Entorno: $ENVIRONMENT"
echo "🌎 Región: $REGION"
[[ "$LOCALSTACK" == true ]] && echo "🔌 Endpoint: LocalStack"
echo

for base_bucket in "${BUCKETS[@]}"; do
  FULL_BUCKET_NAME="${ENVIRONMENT}-${base_bucket}"
  create_bucket "$FULL_BUCKET_NAME"
done

echo
echo "✅ Proceso finalizado"
