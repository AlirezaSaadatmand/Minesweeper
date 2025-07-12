import pygame

colors = {
    1: "blue",
    2: "darkgreen",
    3: "red",
    4: "purple",
    5: "brown",
    6: "pink",
    7: "black",
    8: "gray"
}

class Box:
    def __init__(self, position, bomb, number, show, unit):
        self.position = position
        self.bomb = bomb
        self.number = number
        self.show = show
        self.unit = unit
        self.text_color = colors[number] if number else "black"
        self.color = "darkgray"

        self.top = None
        self.top_right = None
        self.top_left = None
        self.right = None
        self.bottom = None
        self.bottom_right = None
        self.bottom_left = None
        self.left = None

        self.surface = pygame.Surface( ( self.unit, self.unit ) )
        self.surface_rect = self.surface.get_rect(topleft = self.position)

        text = "X" if self.bomb else str(self.number)
        number_text = pygame.font.Font(None, self.unit)
        self.number_text = number_text.render(text, True, self.text_color)
        self.number_text_rect = self.number_text.get_rect(center = (self.position[0] + self.unit // 2 , int(self.position[1] + self.unit // 2)))

    def click(self , n = 0):
        n += 1
        self.show = True
        self.color = "lightgray"

        if self.number == 0:
            for i in [self.top_left, self.top, self.top_right, self.left, self.right, self.bottom_left, self.bottom, self.bottom_right]:
                if i:
                    if not i.show:
                        n = i.click(n)
        return n