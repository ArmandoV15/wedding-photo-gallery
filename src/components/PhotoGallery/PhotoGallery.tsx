import { useEffect, useState } from "react";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase";
import { Row, Col, Button, Image, Modal } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import "./PhotoGallery.css";

interface Photo {
  id: string;
  url: string;
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

  const handleDownload = () => {
    if (!activeMedia) return;
    const link = document.createElement("a");
    link.href = activeMedia.url;
    link.download = activeMedia.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
          <Col key={photo.id}>
            {photo.fileType === "video" ? (
              <video
                src={photo.url}
                onClick={() => handleOpen(photo)}
                style={{
                  width: "100%",
                  height: "auto",
                  borderRadius: "8px",
                  cursor: "pointer",
                }}
                muted
                playsInline
                preload="metadata"
              />
            ) : (
              <Image
                src={photo.url}
                alt={photo.name}
                className="galleryImage"
                onClick={() => handleOpen(photo)}
                fluid
              />
            )}
          </Col>
        ))}
      </Row>

      <Modal show={showModal} onHide={handleClose} centered size="lg">
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
        <Modal.Footer className="justify-content-between">
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
          <Button
            style={{ backgroundColor: "#9CAF88", border: "none" }}
            onClick={handleDownload}
          >
            Save Photo
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default PhotoGallery;
