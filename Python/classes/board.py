import pygame
import random

from classes import box

class Board:
    def __init__(self, width, height, unit, bomb_count):
        self.width = width
        self.height = height
        self.unit = unit
        self.bomb_count = bomb_count
        self.safe_count = 0
        self.gameover = False
        self.gamewin = False

        self.opend = 0

        self.boxes = []

        self.setup_board([width, height], unit, bomb_count)

    def setup_board(self, board_size, unit, bomb_count):
        x_box_count = board_size[0] // unit
        y_box_count = board_size[1] // unit
        box_count = x_box_count * y_box_count
        self.safe_count = box_count - bomb_count
        numbers = [i for i in  range(box_count)]
        numbers = random.sample(numbers, bomb_count)

        lst = [[0 for _ in range(x_box_count)] for _ in range(y_box_count)]
        for num in numbers:
            lst[num // x_box_count][num % x_box_count] = 1

        box_lst = []

        for j in range(y_box_count):
            temp = []
            for i in range(x_box_count):
                neighber_bomb_count = 0
                if i != 0 and j != 0:        
                    if lst[j - 1][i - 1] :
                        neighber_bomb_count += 1
                if j != 0:
                    if lst[j - 1][i]:
                        neighber_bomb_count += 1
                if j != 0 and i != x_box_count - 1:       
                    if lst[j - 1][i + 1] :
                        neighber_bomb_count += 1
                if  i != 0:
                    if lst[j][i - 1] :
                        neighber_bomb_count += 1
                if i != x_box_count - 1:
                    if lst[j][i + 1] :
                        neighber_bomb_count += 1
                if j != y_box_count - 1 and i != 0:
                    if lst[j + 1][i - 1] :
                        neighber_bomb_count += 1
                if j != y_box_count - 1:
                    if lst[j + 1][i]:
                        neighber_bomb_count += 1
                if j != y_box_count - 1 and i != x_box_count - 1:
                    if lst[j + 1][i + 1]:
                        neighber_bomb_count += 1

                position = [i * self.unit, j * self.unit]
                bomb = lst[j][i]

                created_box = box.Box(position, bomb, neighber_bomb_count if not bomb else None, False, self.unit)
                temp.append(created_box)
                self.boxes.append(created_box)
            box_lst.append(temp)

        for j in range(y_box_count):
            for i in range(x_box_count):
                if i != 0 and j != 0:
                    box_lst[j][i].top_left = box_lst[j - 1][i - 1]
                if j != 0:
                    box_lst[j][i].top = box_lst[j - 1][i]
                if j != 0 and i != x_box_count - 1:
                    box_lst[j][i].top_right = box_lst[j - 1][i + 1]                    
                if i != x_box_count - 1:
                    box_lst[j][i].right = box_lst[j][i + 1]
                if j != y_box_count - 1 and i != 0:
                    box_lst[j][i].bottom_left = box_lst[j + 1][i - 1]
                if j != y_box_count - 1:
                    box_lst[j][i].bottom = box_lst[j + 1][i]
                if j != y_box_count - 1 and i != x_box_count - 1:
                    box_lst[j][i].bottom_right = box_lst[j + 1][i + 1]
                if  i != 0:
                    box_lst[j][i].left = box_lst[j][i - 1]

    def click(self, screen):
        mouse_x, mouse_y = pygame.mouse.get_pos()
        if self.gameover or self.gamewin:
            return 
        for box in self.boxes:
            if box.surface_rect.collidepoint((mouse_x , mouse_y)):
                if box.bomb:
                    box.color = "red"
                    for box in self.boxes:
                        if box.bomb:
                            box.show = True
                    self.gameover = True
                else:
                    self.opend += box.click()
                    if self.opend == self.safe_count:
                        self.gamewin = True
                self.draw_board(screen)
                break

    def draw_board(self, screen):
        for box in self.boxes:
            box.surface.fill(box.color)
            screen.blit(box.surface , box.surface_rect)    
            pygame.draw.rect(screen ,"black", box.surface_rect , 1 , 0)
            if box.show and box.number != 0:
                screen.blit(box.number_text , box.number_text_rect)    
        if self.gameover:
            gameover_text = pygame.font.Font(None, 150)
            self.gameover_text = gameover_text.render("game over !!", True, "black")
            self.gameover_text_rect = self.gameover_text.get_rect(center = (self.width // 2, self.height // 2))
            screen.blit(self.gameover_text , self.gameover_text_rect)
        if self.gamewin:
            win_text = pygame.font.Font(None, 150)
            self.win_text = win_text.render("you won !!", True, "black")
            self.win_text_rect = self.win_text.get_rect(center = (self.width // 2, self.height // 2))
            screen.blit(self.win_text , self.win_text_rect)