import { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Button,
  Container,
  Image,
  Spinner,
  Ratio,
  Row,
  Col,
  Modal,
} from "react-bootstrap";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db, storage } from "../../firebase";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import "./PreviewPhoto.css";

interface MediaItem {
  file: File;
  previewUrl: string;
  fileType: string;
}

interface LocationState {
  media: MediaItem[];
}

const SageSpinner = () => (
  <Spinner animation="border" role="status" style={{ color: "#9caf88" }}>
    <span className="visually-hidden">Uploading...</span>
  </Spinner>
);

const PreviewPhoto = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [mediaItems, setMediaItems] = useState<MediaItem[]>(
    (location.state as LocationState | undefined)?.media || []
  );
  const [loading, setLoading] = useState(false);
  const [modalMedia, setModalMedia] = useState<MediaItem | null>(null);
  const videoRefs = useRef<Record<number, HTMLVideoElement | null>>({});

  useEffect(() => {
    if (mediaItems.length === 0) navigate("/");
  }, [mediaItems, navigate]);

  const handleDelete = (index: number) => {
    setMediaItems((prev) => prev.filter((_, i) => i !== index));
    delete videoRefs.current[index];
  };

  const generateThumbnail = (index: number): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const video = videoRefs.current[index];
      if (!video) return reject("Video ref not found");

      const canvas = document.createElement("canvas");
      video.currentTime = 1;

      video.onseeked = () => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject("Canvas context error");

        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(
          (blob) =>
            blob ? resolve(blob) : reject("Failed to create thumbnail blob"),
          "image/jpeg",
          0.75
        );
      };

      if (video.readyState >= 2) {
        video.currentTime = 1;
      } else {
        video.onloadedmetadata = () => {
          video.currentTime = 1;
        };
      }
    });
  };

  const uploadMedia = async () => {
    setLoading(true);
    try {
      for (let i = 0; i < mediaItems.length; i++) {
        const { file, fileType } = mediaItems[i];
        let thumbnailUrl = "";

        if (fileType === "video") {
          const thumbBlob = await generateThumbnail(i);
          const thumbRef = ref(
            storage,
            `wedding-media/thumbnails/${Date.now()}_${file.name}.jpg`
          );
          await uploadBytes(thumbRef, thumbBlob);
          thumbnailUrl = await getDownloadURL(thumbRef);
        }

        const fileRef = ref(
          storage,
          `wedding-media/${Date.now()}_${file.name}`
        );
        await uploadBytes(fileRef, file);
        const url = await getDownloadURL(fileRef);

        await addDoc(collection(db, "wedding-media-urls"), {
          url,
          name: file.name,
          fileType,
          thumbnailUrl: thumbnailUrl || null,
          createdAt: serverTimestamp(),
        });
      }

      alert("All media uploaded successfully!");
      navigate("/");
    } catch (error) {
      console.error("Upload failed", error);
      alert("Upload failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = (item: MediaItem) => {
    setModalMedia(item);
  };

  const handleCloseModal = () => {
    setModalMedia(null);
  };

  return (
    <>
      <div className="stickyButtonWrapper">
        <Button
          variant="secondary"
          className="shadow-sm"
          onClick={() => navigate("/")}
        >
          ← Back
        </Button>

        {!loading ? (
          <Button
            variant="success"
            onClick={uploadMedia}
            className="shadow customBtn"
          >
            Upload All
          </Button>
        ) : (
          <SageSpinner />
        )}
      </div>
      <Container className="text-center mt-2">
        <h2>Moments Preview</h2>
        <Row className="my-4">
          {mediaItems.map((item, index) => (
            <Col xs={6} md={6} key={index} className="mb-4">
              <div className="position-relative">
                <Button
                  variant="dark"
                  size="sm"
                  className="deleteBtn rounded-circle z-3"
                  onClick={() => handleDelete(index)}
                >
                  ×
                </Button>

                {item.fileType === "video" ? (
                  <>
                    <video
                      ref={(el) => {
                        videoRefs.current[index] = el;
                      }}
                      src={item.previewUrl}
                      style={{ display: "none" }}
                      preload="metadata"
                    />
                    <Ratio aspectRatio="1x1">
                      <video
                        src={item.previewUrl}
                        controls
                        className="mediaContent"
                      />
                    </Ratio>
                  </>
                ) : (
                  <Ratio aspectRatio="1x1">
                    <Image
                      src={item.previewUrl}
                      className="mediaContent"
                      onClick={() => handlePreview(item)}
                    />
                  </Ratio>
                )}
              </div>
            </Col>
          ))}
        </Row>
      </Container>

      <Modal show={!!modalMedia} onHide={handleCloseModal} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Preview</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center">
          <Image
            src={modalMedia?.previewUrl}
            fluid
            className="w-100"
            style={{ maxHeight: "70vh", objectFit: "contain" }}
          />
        </Modal.Body>
      </Modal>
    </>
  );
};

export default PreviewPhoto;
