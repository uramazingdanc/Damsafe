"use client";
import React from "react";

function RefreshButton() {
  const [currentScreen, setCurrentScreen] = useState("welcome");
  const [formData, setFormData] = useState({
    height: "",
    width: "",
    waterLevel: "",
    materialDensity: "",
    frictionCoefficient: "",
  });
  const [results, setResults] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [calculationSteps, setCalculationSteps] = useState([]);
  const [showSteps, setShowSteps] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const resetCalculations = async () => {
    setIsResetting(true);
    setResults(null);
    setAnalysis(null);
    setCalculationSteps([]);
    setShowSteps(false);
    setFormData({
      height: "",
      width: "",
      waterLevel: "",
      materialDensity: "",
      frictionCoefficient: "",
    });
    await new Promise((resolve) => setTimeout(resolve, 800));
    setIsResetting(false);
    setCurrentScreen("input");
  };

  const calculateResults = async () => {
    resetCalculations();
    setLoading(true);

    const steps = [];

    const weight = formData.height * formData.width * formData.materialDensity;
    steps.push({
      title: "Forces Calculation",
      icon: "arrows-up-down",
      calculation: `W = Height × Width × Density = ${formData.height} × ${
        formData.width
      } × ${formData.materialDensity} = ${weight.toFixed(2)} kg`,
    });

    const waterPressure = 0.5 * 1000 * 9.81 * Math.pow(formData.waterLevel, 2);
    steps.push({
      title: "Hydrostatic Pressure",
      icon: "water",
      calculation: `P = ½ × ρ × g × h² = ½ × 1000 × 9.81 × ${
        formData.waterLevel
      }² = ${waterPressure.toFixed(2)} N/m²`,
    });

    const resistingMoment = weight * (formData.width / 2);
    steps.push({
      title: "Moment Calculations",
      icon: "sync",
      calculation: `Mr = W × (Width/2) = ${weight.toFixed(2)} × (${
        formData.width
      }/2) = ${resistingMoment.toFixed(2)} Nm`,
    });

    const mockResults = {
      slidingFactor: 1.5,
      overturningFactor: 2.1,
      status: "Stable",
    };
    steps.push({
      title: "Safety Factors",
      icon: "balance-scale",
      calculation: `Sliding Factor = ${mockResults.slidingFactor}\nOverturning Factor = ${mockResults.overturningFactor}`,
    });

    try {
      const response = await fetch("/integrations/chat-gpt/conversationgpt4", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            {
              role: "user",
              content: `Analyze this dam's stability with the following parameters:
              Height: ${formData.height}m
              Width: ${formData.width}m
              Water Level: ${formData.waterLevel}m
              Material Density: ${formData.materialDensity}kg/m³
              Dam Weight: ${weight.toFixed(2)} kg
              Water Pressure: ${waterPressure.toFixed(2)} N/m²
              Sliding Factor: ${mockResults.slidingFactor}
              Overturning Factor: ${mockResults.overturningFactor}
              
              Please provide:
              1. A detailed analysis of these calculations
              2. Safety implications of these values
              3. Specific recommendations based on:
                 - Structural integrity
                 - Maintenance needs
                 - Required monitoring
              4. Risk assessment and mitigation strategies`,
            },
          ],
        }),
      });

      const data = await response.json();
      setAnalysis(data.choices[0].message.content);
      setResults(mockResults);
      setCalculationSteps(steps);

      setTimeout(() => setShowSteps(true), 100);
    } catch (error) {
      console.error("Error getting analysis:", error);
    }

    setLoading(false);
    setCurrentScreen("output");
  };

  return (
    <div className="min-h-screen bg-[#121720]">
      {currentScreen === "welcome" && (
        <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-[#121720]">
          <div className="w-48 h-48 mb-8">
            <img
              src="https://ucarecdn.com/489d2e3b-49b7-4d3b-ab22-e540a862fa30/-/format/auto/"
              alt="Dam Analysis System Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <p className="text-white text-center mb-8 font-roboto text-xl">
            Advanced dam stability analysis for engineering professionals
          </p>
          <button
            onClick={() => setCurrentScreen("input")}
            className="bg-[#4a90e2] text-white px-8 py-4 rounded-2xl font-roboto hover:bg-[#357abd] transition-colors text-xl font-bold shadow-lg"
          >
            Start Assessment
          </button>
        </div>
      )}

      {currentScreen === "input" && (
        <div className="p-6 max-w-md mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <i
                className="fas fa-chevron-left text-[#4a90e2] mr-4 text-xl cursor-pointer"
                onClick={() => setCurrentScreen("welcome")}
              ></i>
              <h2 className="text-2xl font-bold text-white font-roboto">
                Dam Parameters
              </h2>
            </div>
            <div className="relative group">
              <button
                onClick={resetCalculations}
                className="p-2 rounded-full hover:bg-[#242936] transition-colors"
                disabled={isResetting}
              >
                <i
                  className={`fas ${
                    isResetting ? "fa-spinner fa-spin" : "fa-redo"
                  } text-[#4a90e2] text-xl`}
                ></i>
              </button>
              <div className="absolute hidden group-hover:block bg-[#242936] text-white px-2 py-1 rounded text-sm -left-12 -bottom-8 whitespace-nowrap">
                Reset Calculation
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-[#1a1f29] p-6 rounded-2xl shadow-lg border border-[#242936]">
              <h3 className="text-lg font-bold text-[#4a90e2] mb-4 font-roboto">
                Structure Dimensions
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-white mb-2 font-roboto">
                    Dam Height (m)
                  </label>
                  <input
                    name="height"
                    type="number"
                    className="w-full p-4 border-2 border-[#242936] rounded-xl bg-[#121720] text-white focus:border-[#4a90e2] focus:outline-none"
                    value={formData.height}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <label className="block text-white mb-2 font-roboto">
                    Dam Width (m)
                  </label>
                  <input
                    name="width"
                    type="number"
                    className="w-full p-4 border-2 border-[#242936] rounded-xl bg-[#121720] text-white focus:border-[#4a90e2] focus:outline-none"
                    value={formData.width}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function RefreshButtonStory() {
  return (
    <div>
      <RefreshButton />
    </div>
  );
}

export default RefreshButton;