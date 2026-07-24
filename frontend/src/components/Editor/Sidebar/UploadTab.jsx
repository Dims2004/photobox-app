import React, { useCallback, useState, useRef } from "react";
import { useDropzone } from "react-dropzone";
import { FaUpload, FaCamera, FaTimes, FaCircle } from "react-icons/fa";
import { useEditor } from "../../../hooks/useEditor";
import { uploadImages, resolveAssetUrl } from "../../../services/api";

const UploadTab = () => {
  const { addImages } = useEditor();
  const [uploading, setUploading] = useState(false);
  const [previews, setPreviews] = useState([]);
  const [showWebcam, setShowWebcam] = useState(false);
  const [webcamError, setWebcamError] = useState(null);
  const [flash, setFlash] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const handleUploadedFiles = useCallback(
    async (files) => {
      setUploading(true);
      try {
        const formData = new FormData();
        files.forEach((file) => formData.append("images", file));

        const response = await uploadImages(formData);

        if (response.success) {
          const images = response.data.map((img) => ({
            ...img,
            url: resolveAssetUrl(img.url),
          }));
          addImages(images);
          setPreviews((prev) => [
            ...prev,
            ...images.map((img) => ({
              id: img.id,
              url: img.url,
              name: img.originalName || "Foto",
            })),
          ]);
        }
      } catch (error) {
        console.error("Upload failed:", error);
        alert("Gagal mengunggah gambar. Silakan coba lagi.");
      } finally {
        setUploading(false);
      }
    },
    [addImages],
  );

  const onDrop = useCallback(
    (acceptedFiles) => {
      if (acceptedFiles.length === 0) return;
      handleUploadedFiles(acceptedFiles);
    },
    [handleUploadedFiles],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".gif", ".webp"],
    },
    maxSize: 10485760, // 10MB
    multiple: true,
  });

  const removePreview = (id) => {
    setPreviews((prev) => prev.filter((p) => p.id !== id));
  };

  const openWebcam = async () => {
    setWebcamError(null);
    setShowWebcam(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error("Webcam error:", error);
      setWebcamError("Tidak bisa mengakses kamera. Periksa izin kamera pada browser kamu.");
    }
  };

  const closeWebcam = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setShowWebcam(false);
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    if (!video) return;

    setFlash(true);
    setTimeout(() => setFlash(false), 350);

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    // The <video> preview is mirrored via CSS (transform: scaleX(-1)) so
    // it feels natural while framing the shot, like looking in a mirror.
    // The saved photo should NOT be mirrored though, otherwise any text
    // or asymmetric features come out backwards. Flip it back here.
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0);

    canvas.toBlob(async (blob) => {
      const file = new File([blob], `webcam-${Date.now()}.png`, { type: "image/png" });
      await handleUploadedFiles([file]);
      closeWebcam();
    }, "image/png");
  };

  return (
    <div className="upload-tab">
      <div
        {...getRootProps()}
        className={`dropzone ${isDragActive ? "active" : ""}`}
      >
        <input {...getInputProps()} />
        <div className="dropzone-content">
          <FaUpload className="dropzone-icon" />
          <p>Tarik & lepas gambar di sini</p>
          <p className="dropzone-hint">atau klik untuk memilih file</p>
          <p className="dropzone-limits">
            Mendukung JPEG, PNG, GIF, WebP (Maks 10MB)
          </p>
        </div>
      </div>

      <div className="webcam-section">
        <button className="webcam-btn" onClick={openWebcam}>
          <FaCamera />
          Ambil Foto dengan Kamera
        </button>
        <p className="webcam-hint">Gunakan kamera perangkat untuk mengambil foto</p>
      </div>

      {showWebcam && (
        <div className="modal-overlay" onClick={closeWebcam}>
          <div className="modal-content webcam-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeWebcam}>
              <FaTimes />
            </button>
            <h3>Ambil Foto</h3>
            {webcamError ? (
              <p className="webcam-error">{webcamError}</p>
            ) : (
              <>
                <div className="webcam-video-wrap">
                  <video ref={videoRef} autoPlay playsInline className="webcam-video" />
                  {flash && <div className="webcam-flash" />}
                </div>
                <button className="capture-btn" onClick={capturePhoto}>
                  <FaCircle /> Ambil Foto
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {uploading && (
        <div className="uploading-indicator">
          <div className="spinner"></div>
          <p>Mengunggah gambar...</p>
        </div>
      )}

      {previews.length > 0 && (
        <div className="uploaded-previews">
          <h4>Gambar Terunggah ({previews.length})</h4>
          <div className="preview-grid">
            {previews.map((preview, index) => (
              <div
                key={preview.id}
                className="preview-item photo-pop-in"
                style={{ animationDelay: `${Math.min(index, 8) * 60}ms` }}
              >
                <img src={preview.url} alt={preview.name} />
                <button
                  className="preview-remove"
                  onClick={() => removePreview(preview.id)}
                >
                  <FaTimes />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadTab;
