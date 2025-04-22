import React from 'react'

export const CustLoder = () => {
  return (
    <div style={{ 
      position: "fixed", 
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "rgba(255, 255, 255, 0.8)",
      zIndex: 9999
    }}>
      <div style={{ position: "relative", height: "80px", width: "80px" }}>
        <div 
          className="square1"
          style={{
            position: "absolute",
            width: "20px",
            height: "20px",
            background: "#3FB8AF",
            top: "30px",
            left: "30px"
          }}
        ></div>
        <div 
          className="square2"
          style={{
            position: "absolute",
            width: "20px",
            height: "20px",
            background: "#FF3D7F",
            top: "30px",
            left: "30px"
          }}
        ></div>
        <style>{`
          .square1 {
            animation: square1Move 2s infinite, square1Rotate 0.5s infinite;
          }
          .square2 {
            animation: square1Move 2s infinite 1s reverse, square1Rotate 0.5s infinite;
          }
          @keyframes square1Move {
            0% { top: 0; left: 0; }
            25% { top: 60px; left: 0; }
            50% { top: 60px; left: 60px; }
            75% { top: 0; left: 60px; }
            100% { top: 0; left: 0; }
          }
          @keyframes square1Rotate {
            80%, 100% { transform: rotate(180deg); }
          }
        `}</style>
      </div>
    </div>
  )
}