import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Row, Col, Button, Image } from "react-bootstrap";
import ArchTitle from "./ArchTitle";
import "./HomePage.css";
import { getDownloadURL, listAll, ref } from "firebase/storage";
import { storage } from "../../firebase";

const HomePage = () => {
  const CACHE_VERSION = "v1";
  const libraryInputRef = useRef<HTMLInputElement>(null);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const navigate = useNavigate();

  const openPhotoLibrary = () => {
    libraryInputRef.current?.click();
  };

  const handleLibrarySelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const mediaArray = Array.from(files).map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
      fileType: file.type.startsWith("video/") ? "video" : "image",
    }));

    navigate("/preview-photo", {
      state: { media: mediaArray },
    });
  };

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const cacheKey = `homePageImages_${CACHE_VERSION}`;
        const cached = localStorage.getItem(cacheKey);

        if (cached) {
          setImageUrls(JSON.parse(cached));
          return;
        }

        const folderRef = ref(storage, "home-page/");
        const result = await listAll(folderRef);

        const urls = await Promise.all(
          result.items.map((itemRef) => getDownloadURL(itemRef))
        );

        localStorage.setItem(cacheKey, JSON.stringify(urls));
        setImageUrls(urls);
      } catch (error) {
        console.error("Error fetching images:", error);
      }
    };

    fetchImages();
  }, []);

  return (
    <Container className="text-center py-5">
      <ArchTitle text="Alina and Alex's Wedding" />

      <Row className="justify-content-center mb-4">
        <Col xs={12} md={8} lg={6}>
          <div className="photoCollage">
            <img src={imageUrls[1]} alt="Photo 1" className="photo photo1" />
            <img src={imageUrls[2]} alt="Photo 2" className="photo photo2" />
            <img src={imageUrls[0]} alt="Photo 3" className="photo photo3" />
          </div>
        </Col>
      </Row>

      <input
        type="file"
        accept="image/*,video/*"
        ref={libraryInputRef}
        multiple
        onChange={handleLibrarySelect}
        style={{ display: "none" }}
      />

      <Row className="justify-content-center">
        <Col xs={10} md={4} className="d-flex flex-column gap-3">
          <Button className="customBtn" onClick={openPhotoLibrary}>
            Capture Moment
          </Button>
          <Button
            className="customBtn"
            onClick={() => navigate("/photo-gallery")}
          >
            View Gallery
          </Button>
        </Col>
      </Row>
    </Container>
  );
};

export default HomePage;
