import cv2
from ultralytics import YOLO

model = YOLO('yolov8n.pt')

cap = cv2.VideoCapture(0)

while True:
    ret, frame = cap.read()
    if not ret:
        break

    results = model(frame)

    # Draw detections
    annotated_frame = results[0].plot()

    # Count people
    person_count = sum(1 for obj in results[0].boxes.cls if int(obj) == 0)

    cv2.putText(annotated_frame, f'People Count: {person_count}', (20, 40),
                cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)

    cv2.imshow("People Counter (YOLOv8)", annotated_frame)

    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()
