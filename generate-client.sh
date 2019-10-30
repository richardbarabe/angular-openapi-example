#!/usr/bin/env bash

rm -rf generated-sources/user-api
npx openapi-generator generate -i userApi.yaml -g typescript-angular -o generated-sources/user-api --additional-properties=\"npmName=user-api\" 
