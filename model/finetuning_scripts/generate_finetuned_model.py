from openai import OpenAI
client = OpenAI()
import os
import time
from openai import OpenAI

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
from dotenv import load_dotenv

load_dotenv()

# Create a file for the fine-tuning data
training_file = client.files.create(
  file=open("data/final/bangers_finetuning_data_prepared_chat.jsonl", "rb"),
  purpose='fine-tune'
)

# Wait for the file to be processed
training_file = client.files.retrieve(training_file.id)
while training_file.status != 'processed':
    training_file = client.files.retrieve(training_file.id)
    print("File processing...")
    time.sleep(30)

# Create a fine-tuning job
ft_job = client.fine_tuning.jobs.create(training_file=training_file.id, 
                                     model="gpt-4o-2024-08-06", 
                                     suffix="text-to-banger-v3")

# Wait for the fine-tuning job to be processed
ft_job = client.fine_tuning.jobs.retrieve(ft_job.id)
print("Fine-tuning job started...")
print(ft_job)

while ft_job.status != 'succeeded':
    ft_job = client.fine_tuning.jobs.retrieve(ft_job.id)
    time.sleep(30)

print("Fine-tuned model finished training")
print(ft_job)
