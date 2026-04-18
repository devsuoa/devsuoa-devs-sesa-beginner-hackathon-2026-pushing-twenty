import random

file = open("words.txt")
words = file.read().split("\n")
file.close()

new_words = []
for i in range(50):
    word = "aaaaaa"
    while (len(word) > 5 or len(word) < 3):
        word = random.choice(words).strip()
    new_words.append(word)
    print(word)

