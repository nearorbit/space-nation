import React, { useEffect } from "react";

const Game = () => {
  useEffect(() => {}, []);
  return (
    <div>
      <div className="hidden">
        <img
          id="s"
          src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA0AAAB1CAYAAACVmmvQAAABnUlEQVRYR+2XTXLDIAyFwzLH6f0P0eN0SQZmxEjy0x/jRW2nmzQ2HwLx9FDaa+OvEdN776219d17LgZp0JpIRLJWqlcwoTHj+Bwv6X/9nYNiUJQTAiekI2iY3kPIyx5PyiF73l5oBYdzifY1J80MOuzxIlBJsHywJ1hxTtuKWIfmCJYOfX5yVUfpX9rjpeFBojS2y91KtzXhrbUXnRF/f04itEKQ2QizjJYoLCwaLPaDbFjbtNbmYEoqp/IwzRJFPJilLntedFrQ7qVG0eD9VMne7W2Z+4GWDbxqst73GMGidoC3QEvl6CHSIh93jhtlFH/FSFFGYXecUrlVFrxVgLcGan65mZq3e7klQDd52MxzY9RLNc2SN1Y0CD17jFlu19PjBat7dP0LzW0JdNq/LYEhxCt6eVRT5p5+/l79941/PENoABQNgfsQnznaz4jcKsAqjX8O6Y1nlitSngHEVZMFFlQBJlQFUhDUnhfJVLkFWYC5PA94FKRFrBOTVgQH09CITmAJIrAMma1bpHzXli0PdO8nK2J4qSHwjtAHmVDPQwPNoZkAAAAASUVORK5CYII="
        />
      </div>

      <canvas id="c"></canvas>
      <div style={{ color: "white" }} id="score"></div>
    </div>
  );
};

export default Game;
