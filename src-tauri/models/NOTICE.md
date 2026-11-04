# nmp.onnx

The note model from Basic Pitch (Spotify, ICASSP 2022), copied unchanged from the `basic-pitch` 0.4.0 Python package
(`basic_pitch/saved_models/icassp_2022/nmp.onnx`). Licensed under the Apache License 2.0:
https://github.com/spotify/basic-pitch/blob/main/LICENSE

SHA-256: 2c3c1d144bfa61ad236e92e169c13535c880469a12a047d4e73451f2c059a0ec

The song transcriber uses it to find the notes in a separated vocal or bass part. The desktop app runs it with the
bundled ONNX Runtime; the website loads the same file and runs it with ONNX Runtime Web.
