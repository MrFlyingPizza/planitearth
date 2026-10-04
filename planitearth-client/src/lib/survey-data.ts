import type { Survey } from './survey'

export const surveySequence: Survey = {
  id: 'everyday-earth-v1',
  questions: [
    {
      id: 'transport', type: 'single', category: 'Getting around',
      title: 'How do you usually get around?',
      description: 'Think about your most common everyday journeys.',
      options: [
        { id: 'active', label: 'Walking or cycling', effects: { transport: 0.05 }, explanation: 'Walking and cycling have very low direct transport emissions. The haze becomes lighter.', scene: {
          camera: { x: -125, y: 10, zoom: 1.15 }, objects: [{ object: 'car', to: { alpha: 0, x: -180, y: 75 } }],
        } },
        { id: 'transit', label: 'Public transport', effects: { transport: 0.25 }, explanation: 'Sharing a bus or train often lowers emissions per passenger compared with driving alone.', scene: {
          camera: { x: -165, y: -30, zoom: 1.2 }, objects: [{ object: 'car', to: { alpha: 0.2, x: -175, y: 85, scale: 0.8 } }],
        } },
        { id: 'carpool', label: 'Carpooling', effects: { transport: 0.4 }, explanation: 'Sharing a vehicle spreads its emissions across more passengers.', scene: {
          camera: { x: -185, y: 55, zoom: 1.3 }, objects: [{ object: 'car', to: { alpha: 0.65, x: -185, y: 55, scale: 1.05, angle: -8 } }],
        } },
        { id: 'car', label: 'Petrol or diesel car, alone', effects: { transport: 0.9 }, explanation: 'Driving alone in a fuel-burning car tends to produce more emissions per passenger. The haze thickens.', scene: {
          camera: { x: -210, y: -40, zoom: 1.4 }, objects: [{ object: 'car', to: { alpha: 1, x: -205, y: -26, scale: 1.2, angle: 8 } }],
        } },
        { id: 'electric', label: 'Electric car', effects: { transport: 0.3 }, explanation: 'Electric cars have no tailpipe emissions, but electricity generation and manufacturing still matter. This is an illustrative middle-low contribution.', scene: {
          camera: { x: -175, y: 65, zoom: 1.25 }, objects: [{ object: 'car', to: { alpha: 0.8, x: -173, y: 60, scale: 1.1, angle: 0 } }],
        } },
      ],
    },
    {
      id: 'food', type: 'slider', category: 'On your plate',
      title: 'How often do you eat beef or lamb?',
      description: 'Choose the number of days in a typical week.',
      min: 0, max: 7, step: 1, unit: 'days / week', metric: 'agriculture', from: 0.12, to: 0.9, allowSkip: false,
      explanation: 'More frequent beef or lamb meals generally imply higher associated land use and emissions. The tan agricultural patch expands with demand; unused land does not automatically become forest.',
      scene: {
        camera: { from: { x: -90, y: -65, zoom: 1.1 }, to: { x: -48, y: -95, zoom: 1.5 } },
        objects: [{ object: 'farmland', to: { x: -52, y: -77, angle: -8 } }],
      },
    },
    {
      id: 'energy', type: 'single', category: 'Powering home',
      title: 'Where does your electricity mainly come from?',
      description: 'Choose the closest match to your household electricity supply.',
      options: [
        { id: 'renewable', label: 'Mostly renewable sources', effects: { energy: 0.1 }, explanation: 'Renewables generally have lower operational emissions. Clean-energy icons become more prominent and the haze lightens.', scene: {
          camera: { x: 190, y: 30, zoom: 1.25 }, objects: [{ object: 'wind', to: { x: 190, y: 20, angle: 28 } }, { object: 'sun', to: { x: 210, y: -95 } }],
        } },
        { id: 'mixed', label: 'A mix of sources', effects: { energy: 0.5 }, explanation: 'A mixed supply uses both renewable and fuel-burning generation. Actual impact depends on the local mix.', scene: {
          camera: { x: 175, y: -15, zoom: 1.2 }, objects: [{ object: 'factory', to: { x: -195, y: -35, angle: -3 } }, { object: 'wind', to: { x: 202, y: 42, angle: 8 } }],
        } },
        { id: 'fossil', label: 'Mostly fossil fuels', effects: { energy: 0.9 }, explanation: 'Fuel-burning electricity generation produces greenhouse gases. The power-station icon and haze grow.', scene: {
          camera: { x: -200, y: -55, zoom: 1.35 }, objects: [{ object: 'factory', to: { x: -218, y: -35, scale: 1.12, angle: 4 } }],
        } },
        { id: 'unknown', label: 'I don’t know', effects: {}, explanation: 'Your electricity contribution is unassessed. The reference energy mix remains visible, not an estimate of your supply.', scene: {
          camera: { x: 180, y: -80, zoom: 1.1 }, objects: [{ object: 'sun', to: { x: 220, y: -88, angle: 0 } }],
        } },
      ],
    },
    {
      id: 'waste', type: 'multi', category: 'Using things again',
      title: 'Which habits do you regularly practice?',
      description: 'Select all that apply, or continue with none selected.',
      baseEffects: { waste: 0.85 },
      baseScene: { camera: { x: -150, y: 140, zoom: 1.1 } },
      options: [
        { id: 'repair', label: 'Repair or buy second-hand', effects: { waste: -0.22 }, explanation: 'Repair and second-hand purchases can extend product life and reduce demand for new materials.', scene: {
          camera: { x: -150, y: 132, zoom: 1.2 }, objects: [{ object: 'waste-0', to: { x: -179, y: 160, angle: -24 } }],
        } },
        { id: 'reuse', label: 'Use reusable bags, bottles, or containers', effects: { waste: -0.18 }, explanation: 'Repeated reuse can reduce the stream of disposable items.', scene: {
          camera: { x: -130, y: 155, zoom: 1.25 }, objects: [{ object: 'waste-1', to: { x: -142, y: 176, angle: 24 } }],
        } },
        { id: 'recycle', label: 'Recycle accepted materials correctly', effects: { waste: -0.16 }, explanation: 'Correct recycling sends accepted materials toward recovery instead of disposal.', scene: {
          camera: { x: -180, y: 150, zoom: 1.3 }, objects: [{ object: 'waste-2', to: { x: -190, y: 175, angle: -18 } }],
        } },
        { id: 'compost', label: 'Compost food scraps where suitable', effects: { waste: -0.14 }, explanation: 'Suitable composting diverts organic scraps from landfill. Existing pollution is not removed.', scene: {
          camera: { x: -160, y: 120, zoom: 1.25 }, objects: [{ object: 'waste-3', to: { x: -150, y: 188, angle: 18 } }],
        } },
      ],
    },
    {
      id: 'water', type: 'slider', category: 'Every drop',
      title: 'How long is your typical shower?',
      description: 'Choose minutes, or mark this question as not applicable.',
      min: 1, max: 20, step: 1, unit: 'minutes', metric: 'water', from: 0.08, to: 0.95, allowSkip: true,
      explanation: 'Longer showers generally demand more water and water-heating energy. The reservoir shrinks as demand rises; real use depends on flow rate and local water conditions.',
      scene: {
        camera: { from: { x: -75, y: 95, zoom: 1.1 }, to: { x: -30, y: 105, zoom: 1.5 } },
        skippedCamera: { x: -95, y: 125, zoom: 1.05 },
        objects: [{ object: 'water', to: { x: -43, y: 95, angle: 12 } }],
      },
    },
    {
      id: 'habitat', type: 'single', category: 'Room for nature',
      title: 'What is the outdoor space around your home like?',
      description: 'Choose the closest match. Having no outdoor space is not a negative answer.',
      options: [
        { id: 'native', label: 'Mainly native plants, flowers, or trees', effects: { habitat: 0.9 }, explanation: 'Diverse native vegetation can support local wildlife. Green habitat patches and flowers grow.', scene: {
          camera: { x: 82, y: 24, zoom: 1.35 }, objects: [{ object: 'flower-0', to: { x: 30, y: 5, angle: -12 } }, { object: 'flower-1', to: { x: 70, y: 55, angle: 12 } }],
        } },
        { id: 'lawn', label: 'Mainly lawn', effects: { habitat: 0.35 }, explanation: 'A uniform lawn often offers less habitat diversity than native planting and may require irrigation.', scene: {
          camera: { x: 50, y: 30, zoom: 1.2 }, objects: [{ object: 'flower-0', to: { x: 43, y: 36, angle: 0 } }],
        } },
        { id: 'paving', label: 'Mainly paving or artificial surfaces', effects: { habitat: 0.08 }, explanation: 'Hard surfaces provide less habitat and water infiltration. The green habitat patch becomes smaller.', scene: {
          camera: { x: 112, y: 5, zoom: 1.3 }, objects: [{ object: 'flower-0', to: { x: 130, y: 50, angle: 30 } }, { object: 'flower-1', to: { x: 150, y: 70, angle: -20 } }],
        } },
        { id: 'unknown', label: 'No outdoor space / not sure', effects: {}, explanation: 'This contribution is unassessed. The reference habitat remains unchanged.', scene: {
          camera: { x: 70, y: 70, zoom: 1.1 }, objects: [{ object: 'flower-0', to: { x: 38, y: 28, angle: 0 } }],
        } },
      ],
    },
  ],
}
