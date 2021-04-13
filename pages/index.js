import Head from "next/head";
import React, { useState } from "react";
import styles from "../styles/Home.module.css";
import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";

export default function Home() {
    const [videoSrc, setVideoSrc] = useState("");
    const [message, setMessage] = useState("Upload your video file");
    const [fileName, setFileName] = useState("");
    const ffmpeg = createFFmpeg({
        log: true,
    });
    const [file, setFile] = useState(null);
    const [ratio, setRatio] = useState(0);

    const doTranscode = async () => {
        setRatio(0);
        setMessage("Loading converter resources...");
        await ffmpeg.load();
        setMessage("Converting...");
        await ffmpeg.setProgress(({ ratio }) => {
            setRatio(ratio);
            console.log(ratio);
        });
        ffmpeg.FS("writeFile", "test", await fetchFile(file));
        setFileName(file.name);
        await ffmpeg.run("-i", "test", "test.mp4");
        setMessage("Convertion has completed");
        const data = ffmpeg.FS("readFile", "test.mp4");
        setVideoSrc(
            URL.createObjectURL(new Blob([data.buffer], { type: "video/mp4" }))
        );
    };
    return (
        <div className={styles.container}>
            <Head>
                <title>Convert To MP4</title>
                <link rel="icon" href="/convert-to-mp4.ico" />
                <meta
                    name="Description"
                    content="Convert To MP4. Convert any video file format to MP4 format (MPEG-4)."
                />
            </Head>

            <main className={styles.main}>
              <img src="/convert-to-mp4.png" height="120px" style={{ marginBottom: '20px'}}/>
                <h1 className={styles.title}>Convert To MP4</h1>

                <p className={styles.description}>
                    Convert any video file format to MP4 format (MPEG-4)<br/>
                    Just in three steps!<br/>
                </p>
                <div className={styles.grid}>
                    {ratio === 0 ? (
                        <a
                            onClick={() => {
                                if (!file) {
                                    document.getElementById("upload").click();
                                } else {
                                    doTranscode();
                                }
                            }}
                            className={styles.card}
                        >
                            <input
                                type="file"
                                onChange={(e) => {
                                    setFile(e.target.files[0]);
                                }}
                                id="upload"
                                hidden
                            />
                            <h3>{!file ? "Upload" : `Convert`}</h3>
                        </a>
                    ) : ratio === 1 ? (
                        <a
                            onClick={() => {
                                setTimeout(() => {
                                    setFile(null);
                                    setRatio(0);
                                    setMessage("Upload your video file"), 1000;
                                });
                            }}
                            href={`${videoSrc}`}
                            download={`${fileName
                                .split(".")
                                .slice(0, -1)
                                .join(".")}.mp4`}
                            className={styles.card}
                        >
                            <h3>Download</h3>
                        </a>
                    ) : (
                        <a className={styles.card}>
                            <h3 style={{ textAlign: "center" }}>{`${(
                                ratio * 100
                            ).toFixed(2)}%`}</h3>
                        </a>
                    )}
                </div>
                <p>{message}</p>
            </main>

            <footer className={styles.footer}>
                <a
                    href="https://www.buymeacoffee.com/amilasenadheera"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Hey, Buy me a coffee
                    <div style={{ textAlign: "right" }}>
                        <img
                            src="https://img.buymeacoffee.com/api/?name=amilasenadheera&size=300&bg-image=bmc&background=BD5FFF"
                            height="30px"
                        />
                    </div>{" "}
                    !
                </a>
            </footer>
        </div>
    );
}
