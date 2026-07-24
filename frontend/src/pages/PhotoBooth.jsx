import React, { useState, useRef, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaCamera,
  FaArrowLeft,
  FaArrowRight,
  FaUpload,
  FaCheck,
  FaRedo,
  FaDownload,
  FaEdit,
  FaCircle,
} from "react-icons/fa";
import { useEditor } from "../hooks/useEditor";
import { uploadImages, resolveAssetUrl } from "../services/api";
import { SHOT_COUNT_OPTIONS, PHOTOBOOTH_GRID, BACKGROUND_PRESETS } from "../utils/constants";
import { composePhotobooth } from "../utils/photoboothRender";
import { addHistoryEntry } from "../utils/historyStorage";
import "../styles/Photobooth.css";

const STEPS = ["count", "background", "capture", "result"];
const COUNTDOWN_SECONDS = 3;
const RESULT_WIDTH = 1000;
const RESULT_HEIGHT = 1400;

const PhotoBooth = () => {
  const navigate = useNavigate();
  const { addImage } = useEditor();

  const [stepIndex, setStepIndex] = useState(0);
  const [shotCount, setShotCount] = useState(4);
  const [background, setBackground] = useState(BACKGROUND_PRESETS[0]);
  const [customBackgroundImage, setCustomBackgroundImage] = useState(null);
  const [caption, setCaption] = useState("Blooming Your Days");

  const [cameraError, setCameraError] = useState(null);
  const [countdown, setCountdown] = useState(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedShots, setCapturedShots] = useState([]); // dataURLs

  const [resultUrl, setResultUrl] = useState(null);
  const [resultBlob, setResultBlob] = useState(null);
  const [isComposing, setIsComposing] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState(null);

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const timerRef = useRef(null);
  // Source of truth for how many shots have actually been captured this
  // run. Kept in a ref (not state) so the capture loop below never has to
  // put scheduling side-effects inside a setState updater — React 18's
  // StrictMode intentionally double-invokes updater functions in dev to
  // catch exactly that kind of impurity, which was causing extra photos
  // to be captured.
  const shotsRef = useRef([]);
  const capturingRef = useRef(false);

  const step = STEPS[stepIndex];

  const goNext = () => setStepIndex((i) => Math.min(i + 1, STEPS.length - 1));
  const goBack = () => setStepIndex((i) => Math.max(i - 1, 0));

  // --- Camera lifecycle -----------------------------------------------

  const openCamera = useCallback(async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (error) {
      console.error("Camera error:", error);
      setCameraError("Tidak bisa mengakses kamera. Periksa izin kamera pada browser kamu.");
    }
  }, []);

  const closeCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }, []);

  useEffect(() => {
    if (step === "capture") {
      openCamera();
    } else {
      closeCamera();
      clearTimeout(timerRef.current);
      capturingRef.current = false;
    }
    return () => closeCamera();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  // --- Background upload -----------------------------------------------

  const handleBackgroundUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        setCustomBackgroundImage(img);
        setBackground({ id: "custom", label: "Background Kamu", type: "image", image: img });
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  };

  // --- Capture sequence -------------------------------------------------

  const snapFrame = () => {
    const video = videoRef.current;
    if (!video) return null;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    // See UploadTab.jsx for why: preview is mirrored via CSS for a
    // natural framing feel, but the saved photo should not be.
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0);
    return canvas.toDataURL("image/png");
  };

  const startSequence = () => {
    if (capturingRef.current) return; // guard against double-clicks / double-invokes
    capturingRef.current = true;
    shotsRef.current = [];
    setCapturedShots([]);
    setIsCapturing(true);
    runCountdownFor();
  };

  const runCountdownFor = () => {
    let secondsLeft = COUNTDOWN_SECONDS;
    setCountdown(secondsLeft);

    const tick = () => {
      secondsLeft -= 1;
      if (secondsLeft > 0) {
        setCountdown(secondsLeft);
        timerRef.current = setTimeout(tick, 1000);
        return;
      }

      setCountdown(null);
      const dataUrl = snapFrame();
      if (dataUrl) {
        shotsRef.current = [...shotsRef.current, dataUrl];
        setCapturedShots(shotsRef.current);
      }

      if (shotsRef.current.length < shotCount) {
        timerRef.current = setTimeout(runCountdownFor, 700);
      } else {
        capturingRef.current = false;
        setIsCapturing(false);
      }
    };

    timerRef.current = setTimeout(tick, 1000);
  };

  const retakeAll = () => {
    clearTimeout(timerRef.current);
    capturingRef.current = false;
    shotsRef.current = [];
    setCapturedShots([]);
    setCountdown(null);
    setIsCapturing(false);
  };

  // --- Compose final result ---------------------------------------------

  const composeResult = useCallback(async () => {
    setIsComposing(true);
    setSendError(null);
    try {
      const photoImages = await Promise.all(
        capturedShots.map(
          (src) =>
            new Promise((resolve, reject) => {
              const img = new Image();
              img.onload = () => resolve(img);
              img.onerror = reject;
              img.src = src;
            }),
        ),
      );

      const grid = PHOTOBOOTH_GRID[shotCount] || { cols: 2, rows: Math.ceil(shotCount / 2) };

      const canvas = document.createElement("canvas");
      canvas.width = RESULT_WIDTH;
      canvas.height = RESULT_HEIGHT;
      const ctx = canvas.getContext("2d");

      composePhotobooth(ctx, {
        width: RESULT_WIDTH,
        height: RESULT_HEIGHT,
        background,
        photos: photoImages,
        cols: grid.cols,
        rows: grid.rows,
        caption: caption.trim(),
      });

      const dataUrl = canvas.toDataURL("image/png");
      const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));

      setResultUrl(dataUrl);
      setResultBlob(blob);

      // Saved straight into this browser's own history - never touches
      // the server, so it's private to this device only.
      addHistoryEntry({ filename: `photobox-${Date.now()}.png`, dataUrl });

      goNext();
    } catch (error) {
      console.error("Compose failed:", error);
    } finally {
      setIsComposing(false);
    }
  }, [capturedShots, shotCount, background, caption]);

  // --- Result actions -----------------------------------------------

  const handleDownload = () => {
    if (!resultUrl) return;
    const link = document.createElement("a");
    link.href = resultUrl;
    link.download = `photobox-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSendToEditor = async () => {
    if (!resultBlob) return;
    setIsSending(true);
    setSendError(null);
    try {
      const file = new File([resultBlob], `photobooth-${Date.now()}.png`, { type: "image/png" });
      const formData = new FormData();
      formData.append("images", file);

      const response = await uploadImages(formData);
      if (response.success) {
        addImage({ ...response.data[0], url: resolveAssetUrl(response.data[0].url) });
        navigate("/editor");
      } else {
        throw new Error(response.message || "Upload gagal");
      }
    } catch (error) {
      console.error("Failed to send to editor:", error);
      const message = error?.message || "Terjadi kesalahan tak terduga";
      setSendError(`Gagal mengirim ke editor (${message}). Kamu tetap bisa mengunduh hasilnya secara langsung.`);
    } finally {
      setIsSending(false);
    }
  };

  const restartAll = () => {
    setStepIndex(0);
    setShotCount(4);
    setBackground(BACKGROUND_PRESETS[0]);
    setCustomBackgroundImage(null);
    shotsRef.current = [];
    capturingRef.current = false;
    setCapturedShots([]);
    setResultUrl(null);
    setResultBlob(null);
    setSendError(null);
  };

  return (
    <div className="photobooth-container">
      <div className="photobooth-header">
        <h1>
          <FaCamera className="mr-3" />
          Ambil Foto
        </h1>
        <p>Jepret beberapa foto sekaligus, pilih background, langsung jadi photobox</p>

        <div className="photobooth-steps">
          {["Jumlah Foto", "Background", "Jepret", "Hasil"].map((label, i) => (
            <div key={label} className={`step-pill ${i === stepIndex ? "active" : ""} ${i < stepIndex ? "done" : ""}`}>
              <span className="step-number">{i < stepIndex ? <FaCheck /> : i + 1}</span>
              <span className="step-label">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Step 1: shot count */}
      {step === "count" && (
        <div className="photobooth-card">
          <h2>Mau ambil berapa kali foto?</h2>
          <p className="card-hint">Pilih jumlah jepretan, mulai dari 3 sampai 10 kali</p>
          <div className="count-grid">
            {SHOT_COUNT_OPTIONS.map((n) => (
              <button
                key={n}
                className={`count-btn ${shotCount === n ? "active" : ""}`}
                onClick={() => setShotCount(n)}
              >
                {n}×
              </button>
            ))}
          </div>
          <div className="step-actions">
            <button className="btn-primary btn-lg" onClick={goNext}>
              Lanjut <FaArrowRight className="ml-2" />
            </button>
          </div>
        </div>
      )}

      {/* Step 2: background */}
      {step === "background" && (
        <div className="photobooth-card">
          <h2>Pilih Background</h2>
          <p className="card-hint">Pilih salah satu tema atau unggah background sendiri</p>

          <div className="bg-grid">
            {BACKGROUND_PRESETS.map((preset) => (
              <button
                key={preset.id}
                className={`bg-swatch ${background.id === preset.id ? "active" : ""}`}
                style={{
                  background: `linear-gradient(135deg, ${preset.colors[0]}, ${preset.colors[1]})`,
                }}
                onClick={() => setBackground(preset)}
                title={preset.label}
              >
                {background.id === preset.id && <FaCheck className="bg-swatch-check" />}
                <span className="bg-swatch-label">{preset.label}</span>
              </button>
            ))}

            <label className={`bg-swatch bg-upload ${background.id === "custom" ? "active" : ""}`}>
              <FaUpload />
              <span className="bg-swatch-label">Upload Sendiri</span>
              <input type="file" accept="image/*" hidden onChange={handleBackgroundUpload} />
            </label>
          </div>

          {customBackgroundImage && background.id === "custom" && (
            <div className="bg-preview">
              <img src={customBackgroundImage.src} alt="Background pilihan" />
            </div>
          )}

          <div className="property-group" style={{ marginTop: "1.5rem", maxWidth: 420 }}>
            <label>Judul / Caption (opsional)</label>
            <input
              type="text"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Contoh: Blooming Your Days"
              className="text-input"
            />
          </div>

          <div className="step-actions">
            <button className="btn-secondary" onClick={goBack}>
              <FaArrowLeft className="mr-2" /> Kembali
            </button>
            <button className="btn-primary btn-lg" onClick={goNext}>
              Lanjut <FaArrowRight className="ml-2" />
            </button>
          </div>
        </div>
      )}

      {/* Step 3: capture */}
      {step === "capture" && (
        <div className="photobooth-card">
          <h2>Jepret Foto ({capturedShots.length}/{shotCount})</h2>
          <p className="card-hint">
            {isCapturing
              ? "Bersiap-siap! Foto akan diambil otomatis mengikuti hitungan mundur."
              : "Klik mulai, lalu bergaya setiap hitungan mundur selesai."}
          </p>

          <div className="capture-stage">
            <div className="capture-video-wrap">
              {cameraError ? (
                <div className="webcam-error">{cameraError}</div>
              ) : (
                <video ref={videoRef} autoPlay playsInline muted className="webcam-video" />
              )}
              {countdown !== null && (
                <div className="countdown-overlay">
                  <span className="countdown-number">{countdown}</span>
                </div>
              )}
            </div>

            {capturedShots.length > 0 && (
              <div className="captured-thumbs">
                {capturedShots.map((src, i) => (
                  <img
                    key={i}
                    src={src}
                    alt={`Jepretan ${i + 1}`}
                    className="photo-pop-in"
                    style={{ animationDelay: `${i * 40}ms` }}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="step-actions">
            <button className="btn-secondary" onClick={goBack} disabled={isCapturing}>
              <FaArrowLeft className="mr-2" /> Kembali
            </button>

            {capturedShots.length === 0 && !isCapturing && (
              <button className="btn-primary btn-lg" onClick={startSequence} disabled={!!cameraError}>
                <FaCircle className="mr-2" /> Mulai Jepret
              </button>
            )}

            {capturedShots.length > 0 && !isCapturing && (
              <>
                <button className="btn-secondary" onClick={retakeAll}>
                  <FaRedo className="mr-2" /> Ulangi
                </button>
                <button className="btn-primary btn-lg" onClick={composeResult} disabled={isComposing}>
                  {isComposing ? "Menyusun..." : "Susun Photobox"} <FaArrowRight className="ml-2" />
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Step 4: result */}
      {step === "result" && resultUrl && (
        <div className="photobooth-card result-card">
          <h2>Photobox Kamu Siap! 🎉</h2>
          <img src={resultUrl} alt="Hasil photobox" className="result-image photo-pop-in" />

          {sendError && (
            <div className="pb-alert">
              {sendError}
              <button onClick={() => setSendError(null)}>×</button>
            </div>
          )}

          <div className="step-actions">
            <button className="btn-secondary" onClick={restartAll}>
              <FaRedo className="mr-2" /> Buat Baru
            </button>
            <button className="btn-secondary" onClick={handleSendToEditor} disabled={isSending}>
              <FaEdit className="mr-2" /> {isSending ? "Mengirim..." : "Edit Lebih Lanjut"}
            </button>
            <button className="btn-primary btn-lg" onClick={handleDownload}>
              <FaDownload className="mr-2" /> Unduh
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PhotoBooth;
