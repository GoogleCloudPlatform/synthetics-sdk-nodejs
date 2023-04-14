protoc --plugin="../../node_modules/.bin/protoc-gen-ts_proto" --ts_proto_out="./src/generated" "./proto/synthetic_response.proto" --ts_proto_opt=snakeToCamel=false
