This directory contains the proto API request and response contract for Synthetics. To generate typescript files for use within the GCM Synthetics SDK codebase, run the following commands. 

```
$ PROTOC_GEN_TS_PATH="./node_modules/.bin/protoc-gen-ts"
$ OUT_DIR="./src/generated"
$ PROTO_DIR="./proto"
$ protoc --plugin=./node_modules/.bin/protoc-gen-ts_proto --ts_proto_out=./src ./proto/synthetic_response.proto --ts_proto_opt=snakeToCamel=false
```
