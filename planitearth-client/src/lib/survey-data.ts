import type { Survey } from './survey'

export const surveySequence: Survey = {
  id: 'everyday-earth-v1',
  questions: [
    {
      id: 'transport', type: 'single', category: 'Getting around',
      title: 'How do you usually get around?',
      description: 'Think about your most common everyday journeys.',
      options: [
        { id: 'active', label: 'Walking or cycling', effects: { transport: 0.05 }, explanation: 'Walking and cycling have very low direct transport emissions. The haze becomes lighter.' },
        { id: 'transit', label: 'Public transport', effects: { transport: 0.25 }, explanation: 'Sharing a bus or train often lowers emissions per passenger compared with driving alone.' },
        { id: 'carpool', label: 'Carpooling', effects: { transport: 0.4 }, explanation: 'Sharing a vehicle spreads its emissions across more passengers.' },
        { id: 'car', label: 'Petrol or diesel car, alone', effects: { transport: 0.9 }, explanation: 'Driving alone in a fuel-burning car tends to produce more emissions per passenger. The haze thickens.' },
        { id: 'electric', label: 'Electric car', effects: { transport: 0.3 }, explanation: 'Electric cars have no tailpipe emissions, but electricity generation and manufacturing still matter. This is an illustrative middle-low contribution.' },
      ],
    },
    {
      id: 'food', type: 'slider', category: 'On your plate',
      title: 'How often do you eat beef or lamb?',
      description: 'Choose the number of days in a typical week.',
      min: 0, max: 7, step: 1, unit: 'days / week', metric: 'agriculture', from: 0.12, to: 0.9, allowSkip: false,
      explanation: 'More frequent beef or lamb meals generally imply higher associated land use and emissions. The tan agricultural patch expands with demand; unused land does not automatically become forest.',
    },
    {
      id: 'energy', type: 'single', category: 'Powering home',
      title: 'Where does your electricity mainly come from?',
      description: 'Choose the closest match to your household electricity supply.',
      options: [
        { id: 'renewable', label: 'Mostly renewable sources', effects: { energy: 0.1 }, explanation: 'Renewables generally have lower operational emissions. Clean-energy icons become more prominent and the haze lightens.' },
        { id: 'mixed', label: 'A mix of sources', effects: { energy: 0.5 }, explanation: 'A mixed supply uses both renewable and fuel-burning generation. Actual impact depends on the local mix.' },
        { id: 'fossil', label: 'Mostly fossil fuels', effects: { energy: 0.9 }, explanation: 'Fuel-burning electricity generation produces greenhouse gases. The power-station icon and haze grow.' },
        { id: 'unknown', label: 'I don’t know', effects: {}, explanation: 'Your electricity contribution is unassessed. The reference energy mix remains visible, not an estimate of your supply.' },
      ],
    },
    {
      id: 'waste', type: 'multi', category: 'Using things again',
      title: 'Which habits do you regularly practice?',
      description: 'Select all that apply, or continue with none selected.',
      baseEffects: { waste: 0.85 },
      options: [
        { id: 'repair', label: 'Repair or buy second-hand', effects: { waste: -0.22 }, explanation: 'Repair and second-hand purchases can extend product life and reduce demand for new materials.' },
        { id: 'reuse', label: 'Use reusable bags, bottles, or containers', effects: { waste: -0.18 }, explanation: 'Repeated reuse can reduce the stream of disposable items.' },
        { id: 'recycle', label: 'Recycle accepted materials correctly', effects: { waste: -0.16 }, explanation: 'Correct recycling sends accepted materials toward recovery instead of disposal.' },
        { id: 'compost', label: 'Compost food scraps where suitable', effects: { waste: -0.14 }, explanation: 'Suitable composting diverts organic scraps from landfill. Existing pollution is not removed.' },
      ],
    },
    {
      id: 'water', type: 'slider', category: 'Every drop',
      title: 'How long is your typical shower?',
      description: 'Choose minutes, or mark this question as not applicable.',
      min: 1, max: 20, step: 1, unit: 'minutes', metric: 'water', from: 0.08, to: 0.95, allowSkip: true,
      explanation: 'Longer showers generally demand more water and water-heating energy. The reservoir shrinks as demand rises; real use depends on flow rate and local water conditions.',
    },
    {
      id: 'habitat', type: 'single', category: 'Room for nature',
      title: 'What is the outdoor space around your home like?',
      description: 'Choose the closest match. Having no outdoor space is not a negative answer.',
      options: [
        { id: 'native', label: 'Mainly native plants, flowers, or trees', effects: { habitat: 0.9 }, explanation: 'Diverse native vegetation can support local wildlife. Green habitat patches and flowers grow.' },
        { id: 'lawn', label: 'Mainly lawn', effects: { habitat: 0.35 }, explanation: 'A uniform lawn often offers less habitat diversity than native planting and may require irrigation.' },
        { id: 'paving', label: 'Mainly paving or artificial surfaces', effects: { habitat: 0.08 }, explanation: 'Hard surfaces provide less habitat and water infiltration. The green habitat patch becomes smaller.' },
        { id: 'unknown', label: 'No outdoor space / not sure', effects: {}, explanation: 'This contribution is unassessed. The reference habitat remains unchanged.' },
      ],
    },
  ],
}
