class MessageStore:
    """Keep the app's questions and conversation messages in memory.

    Each question has an id, its displayed text, button options, and optional
    replies keyed by the exact button text. Data is reset when the server stops.
    """

    def __init__(self):
        # These starter questions are returned to the frontend when it calls
        # GET /questions. Each response key must match one of that question's options.
        self.questions = [
            {
                "id": 1,
                "text": "How many flights do you take per year?",
                "options": ["0", "1–2", "3–4", "5-6", "7-8", "9-10", "11+"],
                "responses": {
                    "0": "You selected no flights. Avoiding flights can help keep your travel-related greenhouse gas emissions lower.",
                    "1–2": "You selected 1–2 flights. Flights produce greenhouse gas emissions, so choosing alternatives for some trips can reduce your travel footprint.",
                    "3–4": "You selected 3–4 flights. Flights can be a significant source of greenhouse gas emissions; combining trips or choosing rail for some routes may help reduce them.",
                    "5-6": "You selected 5–6 flights. Frequent flying can add substantially to your travel-related greenhouse gas emissions. Could some trips be combined or replaced with lower-emission travel?",
                    "7-8": "You selected 7–8 flights. Frequent flying can add substantially to your travel-related greenhouse gas emissions. Could some trips be combined or replaced with lower-emission travel?",
                    "9-10": "You selected 9–10 flights. Frequent flying can add substantially to your travel-related greenhouse gas emissions. Could some trips be combined or replaced with lower-emission travel?",
                    "11+": "Did you know? Flying releases greenhouse gases that contribute to climate change. Taking 10 or more flights a year can make flying a significant part of your travel footprint.",
                },
            },
            {
                "id": 2,
                "text": "How do you usually get around for short trips?",
                "options": ["Walk or bike", "Public transit", "Drive", "It varies"],
                "responses": {
                    "Walk or bike": "Walking and biking produce very little direct greenhouse gas emissions, and they can be a great choice for short trips.",
                    "Public transit": "Taking public transit can reduce emissions per passenger compared with driving alone, especially when it replaces a car trip.",
                    "Drive": "Driving a car uses fuel or electricity, and its emissions depend on the vehicle and trip. When practical, sharing a ride or choosing transit, walking, or biking can reduce impact.",
                    "It varies": "Your travel impact depends on the trip and how you get there. Choosing walking, biking, transit, or shared rides when practical can help reduce emissions.",
                },
            },
            {
                "id": 3,
                "text": "How often do you eat meat?",
                "options": ["Never", "A few times a month", "A few times a week", "Daily"],
                "responses": {
                    "Never": "Plant-based meals generally have a lower environmental footprint than meals centered on many animal products. Thanks for sharing your eating habit.",
                    "A few times a month": "Having meat a few times a month means many of your meals are meat-free. Choosing plant-based meals more often can be one way to lower food-related emissions.",
                    "A few times a week": "Food impacts vary, but meat—especially beef and lamb—often has higher greenhouse gas emissions than plant-based foods. Swapping some meals for plant-based options may help.",
                    "Daily": "Food impacts vary, but meat—especially beef and lamb—often has higher greenhouse gas emissions than plant-based foods. Trying a plant-based meal now and then is one possible small change.",
                },
            },
            {
                "id": 4,
                "text": "How often does food go uneaten and get thrown away at home?",
                "options": ["Rarely", "Sometimes", "Often"],
                "responses": {
                    "Rarely": "That's great. Planning meals and using leftovers can help keep food waste low. When food is wasted, the resources used to grow and transport it are wasted too.",
                    "Sometimes": "Food waste also wastes the land, water, and energy used to produce food. Meal planning, storing food well, and using leftovers can help reduce it.",
                    "Often": "A lot of food's growing, processing, and transport resources can be lost when it is thrown away. Planning meals, freezing extras, or using leftovers may help.",
                },
            },
            {
                "id": 5,
                "text": "How do you usually get to work or school?",
                "options": ["Walk or bike", "Public transit", "Carpool", "Drive alone", "Work or study from home"],
                "responses": {
                    "Walk or bike": "Walking and biking produce very little direct greenhouse gas emissions. That's a low-emission way to commute when it works for your route.",
                    "Public transit": "Public transit can carry many people in one vehicle, often reducing emissions per passenger compared with driving alone.",
                    "Carpool": "Sharing a car can reduce the number of vehicles making the same trip and may lower emissions per commuter.",
                    "Drive alone": "Driving alone can create more emissions per commuter than sharing a ride or taking transit. If practical, carpooling or using transit for some trips may help.",
                    "Work or study from home": "Working or studying from home avoids commuting emissions on those days, though home energy use also contributes to your overall footprint.",
                },
            },
            {
                "id": 6,
                "text": "How often do you replace clothes that are still usable?",
                "options": ["Almost never", "A few times a year", "About monthly", "More than monthly"],
                "responses": {
                    "Almost never": "Keeping clothes in use for longer can reduce demand for new production and help avoid waste. Repairing or donating items can extend their life too.",
                    "A few times a year": "Clothing production uses materials, energy, and water. Wearing items longer, repairing them, or choosing second-hand can help reduce demand for new clothes.",
                    "About monthly": "Buying fewer new clothes and keeping usable items longer can reduce the resources and emissions associated with clothing production.",
                    "More than monthly": "Frequent clothing purchases can increase demand for resource-intensive production. Buying only what you need, choosing second-hand, or repairing clothes can be alternatives.",
                },
            },
            {
                "id": 7,
                "text": "How often do you use a reusable bottle, cup, or shopping bag?",
                "options": ["Almost always", "Often", "Sometimes", "Rarely or never"],
                "responses": {
                    "Almost always": "Reusable items can help avoid single-use waste, especially when you use them many times. Remembering to bring them is a useful habit.",
                    "Often": "Using reusables often can reduce single-use items. Keeping a bag or bottle somewhere convenient may make them easier to remember.",
                    "Sometimes": "Reusable items help most when they are used repeatedly. Keeping one in your bag or by the door can make it easier to use them more often.",
                    "Rarely or never": "A reusable bottle, cup, or bag can replace many single-use items over time. Starting with one reusable item you use often can be an easy first step.",
                },
            },
            {
                "id": 8,
                "text": "How do you usually heat or cool your home?",
                "options": ["I rarely use heating or cooling", "Heating or cooling is on when needed", "It is on most of the day", "I don't know"],
                "responses": {
                    "I rarely use heating or cooling": "Using less heating or cooling can reduce household energy use, while staying safe and comfortable is important too.",
                    "Heating or cooling is on when needed": "Using heating and cooling only when needed can help manage energy use. Sealing drafts or adjusting the thermostat slightly may also help where practical.",
                    "It is on most of the day": "Heating and cooling can be a significant part of household energy use. If practical, adjusting the thermostat or improving insulation may help reduce energy demand.",
                    "I don't know": "That's okay. Home energy use depends on the building, equipment, and local energy source. Checking your utility bill or asking your household may give you a clearer picture.",
                },
            },
            {
                "id": 9,
                "text": "How often do you buy items you could borrow, repair, or buy second-hand?",
                "options": ["Rarely", "Sometimes", "Often"],
                "responses": {
                    "Rarely": "Borrowing, repairing, and buying second-hand can keep useful items in circulation and reduce demand for new production.",
                    "Sometimes": "Great—borrowing, repairing, or buying second-hand can reduce waste and the resources needed to make new products.",
                    "Often": "That's a helpful habit. Reusing and repairing items can extend their useful life and reduce demand for new materials and production.",
                },
            },
            {
                "id": 10,
                "text": "How do you handle recyclable items at home?",
                "options": ["Sort and recycle most of them", "Recycle some", "Usually throw them away", "Recycling isn't available where I live"],
                "responses": {
                    "Sort and recycle most of them": "Recycling can help recover materials, and following local sorting rules helps keep recyclable loads usable.",
                    "Recycle some": "Recycling what your local program accepts can help recover materials. Checking local guidelines may show which other items belong in the bin.",
                    "Usually throw them away": "If recycling is available, checking local rules and starting with common materials like paper, cans, or bottles may help divert some waste.",
                    "Recycling isn't available where I live": "Thanks for letting us know. Recycling access varies by location, and this isn't something everyone can control. Reusing items and avoiding unnecessary packaging can still help where practical.",
                },
            },
        ]
        self.messages = []
        self.next_question_id = len(self.questions) + 1
        self.next_message_id = 1

    def get_questions(self):
        """Return every question and its button options and responses."""
        return self.questions

    def add_question(self, text, options, responses=None):
        """Add a question, then return it with the next available id.

        `responses` maps button text to the assistant reply for that choice.
        """
        question = {
            "id": self.next_question_id,
            "text": text,
            "options": options,
            "responses": responses or {},
        }
        self.questions.append(question)
        self.next_question_id += 1
        return question

    def has_question(self, question_id):
        """Return whether a question with this id exists."""
        for question in self.questions:
            if question["id"] == question_id:
                return True
        return False

    def get_messages(self):
        """Return all user and assistant messages in the order they were added."""
        return self.messages

    def add_message(self, question_id, role, content):
        """Save one chat message and return it with its generated id.

        `role` is "user" for a selected answer or "assistant" for a reply.
        """
        message = {
            "id": self.next_message_id,
            "question_id": question_id,
            "role": role,
            "content": content,
        }
        self.messages.append(message)
        self.next_message_id += 1
        return message

    def answer_question(self, question_id, answer):
        """Save a valid button choice and its matching assistant reply.

        Return the saved assistant message. Return None if the question id does
        not exist or the answer is not one of its button options.
        """
        for question in self.questions:
            if question["id"] == question_id:
                if answer not in question["options"]:
                    return None

                # Use the tailored reply for this option, or a generic reply
                # when a question was added without one.
                response = question["responses"].get(
                    answer,
                    "Thanks for sharing! Your answer helps us understand your lifestyle's environmental impact.",
                )
                self.add_message(question_id, "user", answer)
                return self.add_message(question_id, "assistant", response)

        return None
