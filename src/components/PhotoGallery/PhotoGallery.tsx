import { useEffect, useState } from "react";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase";
import { Row, Col, Button, Image, Modal, Ratio } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import "./PhotoGallery.css";

interface Photo {
  id: string;
  url: string;
  thumbnailUrl?: string;
  name: string;
  fileType: "image" | "video";
  createdAt: any;
}

const PhotoGallery = () => {
  const navigate = useNavigate();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [activeMedia, setActiveMedia] = useState<Photo | null>(null);

  useEffect(() => {
    const q = query(
      collection(db, "wedding-media-urls"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const photosData: Photo[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Photo, "id">),
      }));
      setPhotos(photosData);
    });

    return () => unsubscribe();
  }, []);

  const handleOpen = (photo: Photo) => {
    setActiveMedia(photo);
    setShowModal(true);
  };

  const handleClose = () => {
    setShowModal(false);
    setActiveMedia(null);
  };

  const handleDownload = async () => {
    if (!activeMedia) return;

    try {
      const link = document.createElement("a");
      link.href = activeMedia.url;
      link.download = activeMedia.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Download failed:", error);
      alert("Download failed. Please try again.");
    }
  };

  return (
    <div style={{ padding: "1rem" }}>
      <Button
        variant="secondary"
        onClick={() => navigate("/")}
        style={{ marginBottom: "1rem" }}
      >
        &larr; Back
      </Button>

      <Row xs={2} sm={2} md={3} lg={4} className="g-3">
        {photos.map((photo) => (
          <Col key={photo.id} style={{ position: "relative" }}>
            <Ratio aspectRatio="1x1">
              <Image
                src={
                  photo.fileType === "video"
                    ? photo.thumbnailUrl || "/default-video-thumb.jpg"
                    : photo.url
                }
                alt={photo.name}
                onClick={() => handleOpen(photo)}
                style={{
                  objectFit: "cover",
                  width: "100%",
                  height: "100%",
                  cursor: "pointer",
                  borderRadius: "8px",
                  display: "block",
                }}
              />
            </Ratio>

            {photo.fileType === "video" && (
              <svg
                viewBox="0 0 64 64"
                fill="white"
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  width: "48px",
                  height: "48px",
                  opacity: 0.8,
                  pointerEvents: "none",
                  filter: "drop-shadow(0 0 3px rgba(0,0,0,0.7))",
                }}
              >
                <circle cx="32" cy="32" r="30" fill="rgba(0,0,0,0.6)" />
                <polygon points="26,20 46,32 26,44" fill="white" />
              </svg>
            )}
          </Col>
        ))}
      </Row>

      <Modal show={showModal} onHide={handleClose} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Preview</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-0">
          {activeMedia &&
            (activeMedia.fileType === "video" ? (
              <video
                src={activeMedia.url}
                controls
                style={{ width: "100%", height: "auto" }}
              />
            ) : (
              <Image
                src={activeMedia.url}
                alt="Full view"
                fluid
                style={{ width: "100%", height: "auto" }}
              />
            ))}
        </Modal.Body>
        <Modal.Footer className="justify-content-center"></Modal.Footer>
      </Modal>
    </div>
  );
};

export default PhotoGallery;
