# nmp.onnx

The note model from Basic Pitch (Spotify, ICASSP 2022), copied unchanged from the `basic-pitch` 0.4.0 Python package
(`basic_pitch/saved_models/icassp_2022/nmp.onnx`). Licensed under the Apache License 2.0:
https://github.com/spotify/basic-pitch/blob/main/LICENSE

SHA-256: 2c3c1d144bfa61ad236e92e169c13535c880469a12a047d4e73451f2c059a0ec

The song transcriber uses it to find the notes in a separated vocal or bass part. The desktop app runs it with the
bundled ONNX Runtime; the website loads the same file and runs it with ONNX Runtime Web.

# scnet_small.onnx (downloaded by the app, not bundled)

The AI stem separator: SCNet (Tong et al., "SCNet: Sparse Compression Network for Music Source Separation", 2024),
the small model trained on MUSDB18 by Roman Solovyev (ZFTurbo) and published in
[Music-Source-Separation-Training](https://github.com/ZFTurbo/Music-Source-Separation-Training) (MIT licence),
release v.1.0.6, `scnet_checkpoint_musdb18.ckpt`. Exported to ONNX (opset 17) for this app with the
Fourier transforms done outside the model; the frequency-axis FFT inside it replaced by an exact matrix form.
Published as a download on the `ai-models-1` release.

SHA-256: 7f05258241fdeadb506f49f793501128ea3b5d0f4104bf7117973f48040241ca (48,175,620 bytes)

MUSDB18 is a research dataset; the model is used here in a free app for learning music.
