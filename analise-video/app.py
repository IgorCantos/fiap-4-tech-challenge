import cv2
import numpy as np
import av
from ultralytics import YOLO
import streamlit as st
from streamlit_webrtc import webrtc_streamer

st.set_page_config(page_title="Fisioterapia IA", layout="wide")
st.title("Visão computacional para fisioterapia")

@st.cache_resource
def load_model():
    return YOLO("yolo11s-pose.pt")

model = load_model()

class ExerciseState:
    def __init__(self):
        self.exercicios = [
            {"nome": "Elevacao Lateral", "meta": 5},
            {"nome": "Ponte", "meta": 5},
            {"nome": "Agachamento", "meta": 5}
        ]
        self.exercicio_atual = 0
        self.repeticoes = 0
        self.estado = "baixo"

@st.cache_resource
def get_state():
    return ExerciseState()

state = get_state()

def video_frame_callback(frame: av.VideoFrame) -> av.VideoFrame:
    img = frame.to_ndarray(format="bgr24")

    # Inverte a imagem (modo espelho) para ficar natural na webcam
    img = cv2.flip(img, 1)

    results = model.track(img, persist=True, conf=0.5, verbose=False)
    annotated_frame = results[0].plot(boxes=False, labels=False)

    nome_exercicio = state.exercicios[state.exercicio_atual]["nome"]
    meta = state.exercicios[state.exercicio_atual]["meta"]

    if results[0].keypoints is not None:
        pontos = results[0].keypoints.xy.cpu().numpy()

        if len(pontos) > 0 and len(pontos[0]) > 0:
            pessoa = pontos[0]

            if len(pessoa) >= 14:
                ombro = pessoa[5]
                punho = pessoa[9]
                quadril = pessoa[11]

                if quadril[0] != 0 or quadril[1] != 0:
                    
                    # ==========================
                    # EXERCÍCIO 1 — PONTE
                    # ==========================
                    if nome_exercicio == "Ponte":
                        altura_quadril = quadril[1]
                        if altura_quadril < 300 and state.estado == "baixo":
                            state.estado = "alto"
                        if altura_quadril > 350 and state.estado == "alto":
                            state.repeticoes += 1
                            state.estado = "baixo"

                    # ==========================
                    # EXERCÍCIO 2 — AGACHAMENTO
                    # ==========================
                    elif nome_exercicio == "Agachamento":
                        altura_quadril = quadril[1]
                        if altura_quadril > 350 and state.estado == "alto":
                            state.estado = "baixo"
                        if altura_quadril < 300 and state.estado == "baixo":
                            state.repeticoes += 1
                            state.estado = "alto"

                if (punho[0] != 0 or punho[1] != 0) and (ombro[0] != 0 or ombro[1] != 0):
                    # ==========================
                    # EXERCÍCIO 3 — ELEVAÇÃO
                    # ==========================
                    if nome_exercicio == "Elevacao Lateral":
                        altura_punho = punho[1]
                        altura_ombro = ombro[1]
                        if altura_punho < altura_ombro and state.estado == "baixo":
                            state.estado = "alto"
                        if altura_punho > altura_ombro and state.estado == "alto":
                            state.repeticoes += 1
                            state.estado = "baixo"

    # ==========================
    # TROCA DE EXERCÍCIO
    # ==========================
    if state.repeticoes >= meta:
        state.exercicio_atual += 1
        state.repeticoes = 0
        state.estado = "baixo"
        if state.exercicio_atual >= len(state.exercicios):
            state.exercicio_atual = len(state.exercicios) - 1

    # ==========================
    # INTERFACE
    # ==========================
    cv2.rectangle(annotated_frame, (10, 10), (500, 120), (0, 0, 0), -1)
    overlay = annotated_frame.copy()
    cv2.rectangle(overlay, (10, 10), (500, 120), (0, 0, 0), -1)
    alpha = 0.5
    cv2.addWeighted(overlay, alpha, annotated_frame, 1 - alpha, 0, annotated_frame)

    cv2.putText(
        annotated_frame,
        f"Exercicio: {state.exercicios[state.exercicio_atual]['nome']}",
        (20, 50),
        cv2.FONT_HERSHEY_SIMPLEX,
        1,
        (0, 255, 0),
        2
    )

    cv2.putText(
        annotated_frame,
        f"Repeticoes: {state.repeticoes}/{meta}",
        (20, 100),
        cv2.FONT_HERSHEY_SIMPLEX,
        1,
        (255, 255, 0),
        2
    )

    return av.VideoFrame.from_ndarray(annotated_frame, format="bgr24")


st.markdown("""
Esta é a versão Web do projeto de análise de vídeo. 
Clique no botão **START** abaixo para permitir o acesso à sua webcam e iniciar a detecção em tempo real.
""")

webrtc_streamer(
    key="fisioterapia",
    video_frame_callback=video_frame_callback,
    rtc_configuration={
        "iceServers": [{"urls": ["stun:stun.l.google.com:19302"]}]
    }
)
