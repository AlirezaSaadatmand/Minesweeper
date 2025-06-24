import pygame
from sys import exit

from classes import board

WIDTH, HEIGHT = 1400, 700
UNIT = 50
bomb_count = 30

pygame.init()
screen = pygame.display.set_mode( (WIDTH , HEIGHT) )
clock = pygame.time.Clock()

board = board.Board(WIDTH, HEIGHT, UNIT, bomb_count)
board.draw_board(screen)

counter = 0
while True :
    counter += 1
    if counter % 30 == 0:
        pygame.display.set_caption(f" FPS : {round(clock.get_fps())} Snake Game")

    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            pygame.quit()
            exit()
        if event.type == pygame.MOUSEBUTTONDOWN:
            board.click(screen)
    pygame.display.update()
    clock.tick(30)